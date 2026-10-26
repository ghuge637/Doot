package com.doot.doot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "application_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientEmail;

    private String recruiterName;

    private String companyName;

    private String jobRole;

    private String status; // SENT, FAILED

    private String subject;

    @Column(columnDefinition = "CLOB")
    private String errorMessage;

    private LocalDateTime sentAt;

    @PrePersist
    public void prePersist() {
        if (this.sentAt == null) {
            this.sentAt = LocalDateTime.now();
        }
    }

    public static ApplicationLogBuilder builder() {
        return new ApplicationLogBuilder();
    }

    public static class ApplicationLogBuilder {
        private Long id;
        private String recipientEmail;
        private String recruiterName;
        private String companyName;
        private String jobRole;
        private String status;
        private String subject;
        private String errorMessage;
        private LocalDateTime sentAt;

        public ApplicationLogBuilder id(Long id) { this.id = id; return this; }
        public ApplicationLogBuilder recipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; return this; }
        public ApplicationLogBuilder recruiterName(String recruiterName) { this.recruiterName = recruiterName; return this; }
        public ApplicationLogBuilder companyName(String companyName) { this.companyName = companyName; return this; }
        public ApplicationLogBuilder jobRole(String jobRole) { this.jobRole = jobRole; return this; }
        public ApplicationLogBuilder status(String status) { this.status = status; return this; }
        public ApplicationLogBuilder subject(String subject) { this.subject = subject; return this; }
        public ApplicationLogBuilder errorMessage(String errorMessage) { this.errorMessage = errorMessage; return this; }
        public ApplicationLogBuilder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }

        public ApplicationLog build() {
            ApplicationLog log = new ApplicationLog();
            log.setId(id);
            log.setRecipientEmail(recipientEmail);
            log.setRecruiterName(recruiterName);
            log.setCompanyName(companyName);
            log.setJobRole(jobRole);
            log.setStatus(status);
            log.setSubject(subject);
            log.setErrorMessage(errorMessage);
            log.setSentAt(sentAt);
            return log;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}