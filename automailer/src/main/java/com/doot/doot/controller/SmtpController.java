package com.doot.doot.controller;

import com.doot.doot.model.SmtpConfig;
import com.doot.doot.service.SmtpConfigService;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/smtp")
public class SmtpController {

    private final SmtpConfigService smtpConfigService;

    public SmtpController(SmtpConfigService smtpConfigService) {
        this.smtpConfigService = smtpConfigService;
    }

    @GetMapping("/config")
    public ResponseEntity<SmtpConfig> getConfig() {
        return ResponseEntity.ok(smtpConfigService.getSmtpConfig());
    }

    @PostMapping("/config")
    public ResponseEntity<SmtpConfig> saveConfig(@RequestBody SmtpConfig config) {
        return ResponseEntity.ok(smtpConfigService.saveSmtpConfig(config));
    }

    @PostMapping("/test")
    public ResponseEntity<?> testSmtp(@RequestBody TestEmailRequest request) {
        try {
            SmtpConfig config = request.getConfig() != null ? request.getConfig() : smtpConfigService.getSmtpConfig();
            String targetEmail = request.getRecipientEmail() != null && !request.getRecipientEmail().isEmpty()
                    ? request.getRecipientEmail() : config.getUsername();

            if (targetEmail == null || targetEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No recipient email provided for test."));
            }

            smtpConfigService.sendTestEmail(config, targetEmail);
            return ResponseEntity.ok(Map.of("message", "Test email sent successfully to " + targetEmail + "! Check your inbox."));
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Unknown error";
            if (msg.contains("Authentication failed") || msg.contains("535") || msg.contains("Username and Password not accepted")) {
                msg = "Authentication failed: Gmail requires a 16-character Google App Password (not your normal account password). Please see Google Security > App Passwords.";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", msg));
        }
    }

    @Data
    public static class TestEmailRequest {
        private SmtpConfig config;
        private String recipientEmail;

        public TestEmailRequest() {}

        public SmtpConfig getConfig() {
            return config;
        }

        public void setConfig(SmtpConfig config) {
            this.config = config;
        }

        public String getRecipientEmail() {
            return recipientEmail;
        }

        public void setRecipientEmail(String recipientEmail) {
            this.recipientEmail = recipientEmail;
        }
    }
}