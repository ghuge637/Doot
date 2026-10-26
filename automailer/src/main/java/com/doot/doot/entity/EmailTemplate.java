package com.doot.doot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String subject;

    @Column(columnDefinition = "CLOB")
    private String body;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static EmailTemplateBuilder builder() {
        return new EmailTemplateBuilder();
    }

    public static class EmailTemplateBuilder {
        private Long id;
        private String name;
        private String subject;
        private String body;
        private LocalDateTime updatedAt;

        public EmailTemplateBuilder id(Long id) { this.id = id; return this; }
        public EmailTemplateBuilder name(String name) { this.name = name; return this; }
        public EmailTemplateBuilder subject(String subject) { this.subject = subject; return this; }
        public EmailTemplateBuilder body(String body) { this.body = body; return this; }
        public EmailTemplateBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public EmailTemplate build() {
            EmailTemplate t = new EmailTemplate();
            t.setId(id);
            t.setName(name);
            t.setSubject(subject);
            t.setBody(body);
            t.setUpdatedAt(updatedAt);
            return t;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}