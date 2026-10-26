package com.doot.doot.service;

import com.doot.doot.model.Recipient;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class TemplateEngineService {

    public static final String DEFAULT_COMPANY_FALLBACK = "your company";
    public static final String DEFAULT_NAME_FALLBACK = "Hiring Team";
    public static final String DEFAULT_ROLE_FALLBACK = "Software Developer";

    public String render(String text, Recipient recipient) {
        if (text == null) return "";
        if (recipient == null) return text;

        String name = (recipient.getResolvedName() != null && !recipient.getResolvedName().trim().isEmpty())
                ? recipient.getResolvedName().trim() : DEFAULT_NAME_FALLBACK;

        String company = (recipient.getResolvedCompany() != null && !recipient.getResolvedCompany().trim().isEmpty())
                ? recipient.getResolvedCompany().trim() : DEFAULT_COMPANY_FALLBACK;

        // Prevent any legacy or accidental "your esteemed organization" text
        if ("your esteemed organization".equalsIgnoreCase(company)) {
            company = DEFAULT_COMPANY_FALLBACK;
        }

        String role = (recipient.getJobRole() != null && !recipient.getJobRole().trim().isEmpty())
                ? recipient.getJobRole().trim() : DEFAULT_ROLE_FALLBACK;

        String email = recipient.getEmail() != null ? recipient.getEmail() : "";

        String capitalizedCompany = capitalizeWords(company);

        return text
                .replace("{{name}}", name)
                .replace("{{Name}}", name)
                .replace("{{NAME}}", name.toUpperCase())
                .replace("{{company}}", company)
                .replace("{{Company}}", capitalizedCompany)
                .replace("{{COMPANY}}", company.toUpperCase())
                .replace("{{role}}", role)
                .replace("{{Role}}", role)
                .replace("{{ROLE}}", role.toUpperCase())
                .replace("{{email}}", email);
    }

    public Map<String, String> renderPreview(String subjectTemplate, String bodyTemplate, Recipient recipient) {
        String renderedSubject = render(subjectTemplate, recipient);
        String renderedBody = render(bodyTemplate, recipient);

        String company = recipient != null && recipient.getResolvedCompany() != null
                ? recipient.getResolvedCompany() : DEFAULT_COMPANY_FALLBACK;
        if ("your esteemed organization".equalsIgnoreCase(company)) {
            company = DEFAULT_COMPANY_FALLBACK;
        }

        return Map.of(
                "subject", renderedSubject,
                "body", renderedBody,
                "recipientEmail", (recipient != null && recipient.getEmail() != null) ? recipient.getEmail() : "",
                "resolvedName", (recipient != null && recipient.getResolvedName() != null) ? recipient.getResolvedName() : DEFAULT_NAME_FALLBACK,
                "resolvedCompany", company
        );
    }

    private String capitalizeWords(String str) {
        if (str == null || str.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (String w : str.split("\\s+")) {
            if (!w.isEmpty()) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(Character.toUpperCase(w.charAt(0)));
                if (w.length() > 1) {
                    sb.append(w.substring(1));
                }
            }
        }
        return sb.toString();
    }
}