package com.doot.doot.service;

import com.doot.doot.entity.ApplicationLog;
import com.doot.doot.model.Recipient;
import com.doot.doot.model.SmtpConfig;
import com.doot.doot.repository.ApplicationLogRepository;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class ThrottledQueueEngine {

    private static final Logger log = LoggerFactory.getLogger(ThrottledQueueEngine.class);

    private final SmtpConfigService smtpConfigService;
    private final TemplateEngineService templateEngineService;
    private final ResumeStorageService resumeStorageService;
    private final ApplicationLogRepository applicationLogRepository;
    private final SseProgressService sseProgressService;

    public ThrottledQueueEngine(
            SmtpConfigService smtpConfigService,
            TemplateEngineService templateEngineService,
            ResumeStorageService resumeStorageService,
            ApplicationLogRepository applicationLogRepository,
            SseProgressService sseProgressService
    ) {
        this.smtpConfigService = smtpConfigService;
        this.templateEngineService = templateEngineService;
        this.resumeStorageService = resumeStorageService;
        this.applicationLogRepository = applicationLogRepository;
        this.sseProgressService = sseProgressService;
    }

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    public enum CampaignState {
        IDLE, RUNNING, PAUSED, STOPPED
    }

    @Data
    public static class CampaignStatus {
        private CampaignState state = CampaignState.IDLE;
        private int total = 0;
        private int sent = 0;
        private int failed = 0;
        private int current = 0;
        private String currentRecipient = "";
        private int delayRemaining = 0;
        private String lastError = "";

        public CampaignStatus() {}

        public CampaignState getState() { return state; }
        public void setState(CampaignState state) { this.state = state; }
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
        public int getSent() { return sent; }
        public void setSent(int sent) { this.sent = sent; }
        public int getFailed() { return failed; }
        public void setFailed(int failed) { this.failed = failed; }
        public int getCurrent() { return current; }
        public void setCurrent(int current) { this.current = current; }
        public String getCurrentRecipient() { return currentRecipient; }
        public void setCurrentRecipient(String currentRecipient) { this.currentRecipient = currentRecipient; }
        public int getDelayRemaining() { return delayRemaining; }
        public void setDelayRemaining(int delayRemaining) { this.delayRemaining = delayRemaining; }
        public String getLastError() { return lastError; }
        public void setLastError(String lastError) { this.lastError = lastError; }
    }

    private final CampaignStatus currentStatus = new CampaignStatus();
    private final AtomicBoolean stopSignal = new AtomicBoolean(false);
    private final AtomicBoolean pauseSignal = new AtomicBoolean(false);

    public synchronized CampaignStatus getStatus() {
        return currentStatus;
    }

    public synchronized void startCampaign(
            List<Recipient> recipients,
            String subjectTemplate,
            String bodyTemplate,
            int minDelay,
            int maxDelay
    ) {
        if (currentStatus.getState() == CampaignState.RUNNING) {
            throw new IllegalStateException("A campaign is already running.");
        }

        SmtpConfig smtpConfig = smtpConfigService.getSmtpConfig();
        if (smtpConfig.getUsername() == null || smtpConfig.getUsername().trim().isEmpty() ||
                smtpConfig.getPassword() == null || smtpConfig.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("SMTP configuration is missing. Please configure your email and app password in settings.");
        }

        List<Recipient> validRecipients = new ArrayList<>();
        for (Recipient r : recipients) {
            if (r.isValid() && r.getEmail() != null && !r.getEmail().trim().isEmpty()) {
                validRecipients.add(r);
            }
        }

        if (validRecipients.isEmpty()) {
            throw new IllegalArgumentException("No valid recipients to send to.");
        }

        stopSignal.set(false);
        pauseSignal.set(false);

        currentStatus.setState(CampaignState.RUNNING);
        currentStatus.setTotal(validRecipients.size());
        currentStatus.setSent(0);
        currentStatus.setFailed(0);
        currentStatus.setCurrent(0);
        currentStatus.setLastError("");

        sseProgressService.emitEvent("CAMPAIGN_STARTED", Map.of(
                "total", currentStatus.getTotal(),
                "minDelay", minDelay,
                "maxDelay", maxDelay
        ));

        executor.submit(() -> executeCampaign(validRecipients, subjectTemplate, bodyTemplate, minDelay, maxDelay));
    }

    public synchronized void pauseCampaign() {
        if (currentStatus.getState() == CampaignState.RUNNING) {
            pauseSignal.set(true);
            currentStatus.setState(CampaignState.PAUSED);
            sseProgressService.emitEvent("CAMPAIGN_PAUSED", Map.of("message", "Campaign paused by user."));
        }
    }

    public synchronized void resumeCampaign() {
        if (currentStatus.getState() == CampaignState.PAUSED) {
            pauseSignal.set(false);
            currentStatus.setState(CampaignState.RUNNING);
            sseProgressService.emitEvent("CAMPAIGN_RESUMED", Map.of("message", "Campaign resumed."));
        }
    }

    public synchronized void stopCampaign() {
        stopSignal.set(true);
        pauseSignal.set(false);
        currentStatus.setState(CampaignState.STOPPED);
        currentStatus.setDelayRemaining(0);
        sseProgressService.emitEvent("CAMPAIGN_STOPPED", Map.of("message", "Campaign stopped by user."));
    }

    private void executeCampaign(
            List<Recipient> recipients,
            String subjectTemplate,
            String bodyTemplate,
            int minDelay,
            int maxDelay
    ) {
        SmtpConfig smtpConfig = smtpConfigService.getSmtpConfig();
        JavaMailSender mailSender = smtpConfigService.createMailSender(smtpConfig);
        File resumeFile = resumeStorageService.getActiveResumeFile();

        for (int i = 0; i < recipients.size(); i++) {
            if (stopSignal.get()) {
                break;
            }

            while (pauseSignal.get()) {
                if (stopSignal.get()) break;
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

            if (stopSignal.get()) break;

            Recipient recipient = recipients.get(i);
            currentStatus.setCurrent(i + 1);
            currentStatus.setCurrentRecipient(recipient.getEmail());

            String renderedSubject = templateEngineService.render(subjectTemplate, recipient);
            String renderedBody = templateEngineService.render(bodyTemplate, recipient);

            boolean success = false;
            String errorMsg = "";

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                String fromName = smtpConfig.getFromName() != null && !smtpConfig.getFromName().isEmpty()
                        ? smtpConfig.getFromName() : "Applicant";
                helper.setFrom(new InternetAddress(smtpConfig.getUsername(), fromName));
                helper.setTo(recipient.getEmail());
                helper.setSubject(renderedSubject);

                // Format body text with clean line breaks
                String htmlBody = "<div style='font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1F2937; white-space: pre-line;'>"
                        + escapeHtml(renderedBody)
                        + "</div>";
                helper.setText(htmlBody, true);

                if (resumeFile != null && resumeFile.exists()) {
                    helper.addAttachment(resumeFile.getName(), resumeFile);
                }

                mailSender.send(message);
                success = true;
                currentStatus.setSent(currentStatus.getSent() + 1);

                // Save log
                applicationLogRepository.save(ApplicationLog.builder()
                        .recipientEmail(recipient.getEmail())
                        .recruiterName(recipient.getResolvedName())
                        .companyName(recipient.getResolvedCompany())
                        .jobRole(recipient.getJobRole())
                        .subject(renderedSubject)
                        .status("SENT")
                        .sentAt(LocalDateTime.now())
                        .build());

                sseProgressService.emitEvent("EMAIL_SENT", Map.of(
                        "index", i + 1,
                        "total", recipients.size(),
                        "recipient", recipient.getEmail(),
                        "company", recipient.getResolvedCompany(),
                        "name", recipient.getResolvedName(),
                        "status", "SENT",
                        "sentCount", currentStatus.getSent(),
                        "failedCount", currentStatus.getFailed()
                ));

            } catch (Exception e) {
                log.error("Failed to send email to {}", recipient.getEmail(), e);
                errorMsg = e.getMessage();
                currentStatus.setFailed(currentStatus.getFailed() + 1);
                currentStatus.setLastError(errorMsg);

                applicationLogRepository.save(ApplicationLog.builder()
                        .recipientEmail(recipient.getEmail())
                        .recruiterName(recipient.getResolvedName())
                        .companyName(recipient.getResolvedCompany())
                        .jobRole(recipient.getJobRole())
                        .subject(renderedSubject)
                        .status("FAILED")
                        .errorMessage(errorMsg)
                        .sentAt(LocalDateTime.now())
                        .build());

                sseProgressService.emitEvent("EMAIL_FAILED", Map.of(
                        "index", i + 1,
                        "total", recipients.size(),
                        "recipient", recipient.getEmail(),
                        "error", errorMsg,
                        "sentCount", currentStatus.getSent(),
                        "failedCount", currentStatus.getFailed()
                ));
            }

            // Anti-Spam Human Delay Loop (only if more emails remain and not stopped)
            if (i < recipients.size() - 1 && !stopSignal.get()) {
                int safeMin = Math.max(10, minDelay);
                int safeMax = Math.max(safeMin, maxDelay);
                int delaySeconds = ThreadLocalRandom.current().nextInt(safeMin, safeMax + 1);

                String nextRecipientEmail = recipients.get(i + 1).getEmail();

                for (int s = delaySeconds; s > 0; s--) {
                    if (stopSignal.get()) break;

                    while (pauseSignal.get()) {
                        if (stopSignal.get()) break;
                        try {
                            Thread.sleep(500);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }

                    if (stopSignal.get()) break;

                    currentStatus.setDelayRemaining(s);
                    sseProgressService.emitEvent("COUNTDOWN", Map.of(
                            "secondsRemaining", s,
                            "totalDelay", delaySeconds,
                            "nextRecipient", nextRecipientEmail
                    ));

                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        currentStatus.setState(CampaignState.IDLE);
        currentStatus.setDelayRemaining(0);
        sseProgressService.emitEvent("CAMPAIGN_COMPLETED", Map.of(
                "total", currentStatus.getTotal(),
                "sent", currentStatus.getSent(),
                "failed", currentStatus.getFailed()
        ));
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&")
                .replace("<", "<")
                .replace(">", ">");
    }
}