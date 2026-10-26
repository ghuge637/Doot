package com.doot.doot.controller;

import com.doot.doot.entity.EmailTemplate;
import com.doot.doot.model.Recipient;
import com.doot.doot.repository.EmailTemplateRepository;
import com.doot.doot.service.TemplateEngineService;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final EmailTemplateRepository templateRepository;
    private final TemplateEngineService templateEngineService;

    public TemplateController(EmailTemplateRepository templateRepository, TemplateEngineService templateEngineService) {
        this.templateRepository = templateRepository;
        this.templateEngineService = templateEngineService;
    }

    @PostConstruct
    public void seedDefaultTemplates() {
        if (templateRepository.count() == 0) {
            templateRepository.save(EmailTemplate.builder()
                    .name("Software Developer Job Pitch (Recommended)")
                    .subject("Application for {{role}} Role - [Your Name]")
                    .body("Dear {{name}},\n\n" +
                            "I hope this email finds you well.\n\n" +
                            "I am reaching out to express my keen interest in software engineering opportunities at {{company}}. " +
                            "With a solid background in full-stack software development, Java, Spring Boot, modern web technologies, and database architecture, " +
                            "I am eager to contribute effectively to your engineering team.\n\n" +
                            "I have attached my resume for your kind review. I would welcome the opportunity to discuss how my technical skills and enthusiasm align with your current or upcoming openings.\n\n" +
                            "Thank you for your time and consideration.\n\n" +
                            "Warm regards,\n" +
                            "[Your Name]\n" +
                            "[Your Phone Number] | [Your LinkedIn / GitHub]")
                    .build());

            templateRepository.save(EmailTemplate.builder()
                    .name("Direct Recruiter Follow-up Pitch")
                    .subject("Following Up: {{role}} Opportunities at {{company}}")
                    .body("Hi {{name}},\n\n" +
                            "I hope you are having a productive week.\n\n" +
                            "I recently explored the innovative work being done at {{company}} and wanted to follow up directly regarding any open or upcoming {{role}} roles.\n\n" +
                            "My experience includes developing robust backend services, scalable REST APIs, and clean user interfaces. Please find my resume attached for details on my past projects and technical background.\n\n" +
                            "Looking forward to hearing from you!\n\n" +
                            "Best regards,\n" +
                            "[Your Name]")
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<List<EmailTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateRepository.findAllByOrderByUpdatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<EmailTemplate> saveTemplate(@RequestBody EmailTemplate template) {
        if (template.getName() == null || template.getName().trim().isEmpty()) {
            template.setName("Untitled Template");
        }
        EmailTemplate saved = templateRepository.save(template);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/preview")
    public ResponseEntity<Map<String, String>> previewTemplate(@RequestBody PreviewRequest request) {
        Recipient sampleRecipient = request.getRecipient();
        if (sampleRecipient == null) {
            sampleRecipient = Recipient.builder()
                    .email("recruiter@example.com")
                    .resolvedName("Alex")
                    .resolvedCompany("TechCorp")
                    .jobRole("Software Developer")
                    .build();
        }
        Map<String, String> preview = templateEngineService.renderPreview(
                request.getSubject(), request.getBody(), sampleRecipient
        );
        return ResponseEntity.ok(preview);
    }

    @Data
    public static class PreviewRequest {
        private String subject;
        private String body;
        private Recipient recipient;

        public PreviewRequest() {}

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getBody() {
            return body;
        }

        public void setBody(String body) {
            this.body = body;
        }

        public Recipient getRecipient() {
            return recipient;
        }

        public void setRecipient(Recipient recipient) {
            this.recipient = recipient;
        }
    }
}