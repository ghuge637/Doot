package com.doot.doot.service;

import com.doot.doot.entity.SmtpSettingsEntity;
import com.doot.doot.model.SmtpConfig;
import com.doot.doot.repository.SmtpSettingsRepository;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.Properties;

@Service
public class SmtpConfigService {

    private final SmtpSettingsRepository smtpSettingsRepository;
    private final ResumeStorageService resumeStorageService;

    public SmtpConfigService(SmtpSettingsRepository smtpSettingsRepository, ResumeStorageService resumeStorageService) {
        this.smtpSettingsRepository = smtpSettingsRepository;
        this.resumeStorageService = resumeStorageService;
    }

    @PostConstruct
    public void initDefaultSettings() {
        if (smtpSettingsRepository.count() == 0) {
            smtpSettingsRepository.save(SmtpSettingsEntity.builder()
                    .id(1L)
                    .host("smtp.gmail.com")
                    .port(587)
                    .username("")
                    .password("")
                    .fromName("Software Developer")
                    .build());
        }
    }

    public SmtpConfig getSmtpConfig() {
        return smtpSettingsRepository.findById(1L)
                .map(entity -> SmtpConfig.builder()
                        .host(entity.getHost())
                        .port(entity.getPort())
                        .username(entity.getUsername())
                        .password(entity.getPassword())
                        .fromName(entity.getFromName())
                        .build())
                .orElse(SmtpConfig.builder()
                        .host("smtp.gmail.com")
                        .port(587)
                        .fromName("Software Developer")
                        .build());
    }

    public SmtpConfig saveSmtpConfig(SmtpConfig config) {
        SmtpSettingsEntity entity = SmtpSettingsEntity.builder()
                .id(1L)
                .host(config.getHost())
                .port(config.getPort())
                .username(config.getUsername())
                .password(config.getPassword())
                .fromName(config.getFromName())
                .build();
        smtpSettingsRepository.save(entity);
        return config;
    }

    public JavaMailSender createMailSender(SmtpConfig config) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(config.getHost());
        mailSender.setPort(config.getPort());
        String username = config.getUsername() != null ? config.getUsername().trim() : "";
        String password = config.getPassword() != null ? config.getPassword().replaceAll("\\s+", "") : "";
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "*");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        return mailSender;
    }

    public void sendTestEmail(SmtpConfig config, String recipientEmail) throws Exception {
        JavaMailSender mailSender = createMailSender(config);
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        String fromName = config.getFromName() != null && !config.getFromName().isEmpty()
                ? config.getFromName() : "Doot";
        helper.setFrom(new InternetAddress(config.getUsername(), fromName));
        helper.setTo(recipientEmail);
        helper.setSubject("Doot Test Email - Ready to Send Applications");

        File resume = resumeStorageService.getActiveResumeFile();
        String resumeNotice = (resume != null)
                ? "<p style='color: #10B981; font-weight: bold;'>Resume Attached: " + resume.getName() + " (" + (resume.length() / 1024) + " KB)</p>"
                : "<p style='color: #F59E0B;'>Note: No resume is currently uploaded in Doot.</p>";

        String html = "<div style='font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;'>"
                + "<h2 style='color: #4F46E5;'>Doot Configuration Verified!</h2>"
                + "<p>Hello,</p>"
                + "<p>This is a verification test email dispatched from your <strong>Doot System</strong>.</p>"
                + "<p>If you are receiving this message in your inbox, your SMTP credentials and email dispatch engine are functioning flawlessly!</p>"
                + resumeNotice
                + "<hr style='border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;'/>"
                + "<p style='color: #6B7280; font-size: 12px;'>Sent via Doot Automated Job Application & Cold Email Dispatcher</p>"
                + "</div>";

        helper.setText(html, true);

        if (resume != null && resume.exists()) {
            helper.addAttachment(resume.getName(), resume);
        }

        mailSender.send(mimeMessage);
    }
}