package com.doot.doot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recipient {
    private String id;
    private String email;
    private String rawCompany;
    private String resolvedCompany;
    private String rawName;
    private String resolvedName;
    private String jobRole;
    private boolean valid;
    
    @Builder.Default
    private List<String> warnings = new ArrayList<>();
    
    @Builder.Default
    private String status = "READY"; // READY, SKIPPED, SENT, FAILED

    public static RecipientBuilder builder() {
        return new RecipientBuilder();
    }

    public static class RecipientBuilder {
        private String id;
        private String email;
        private String rawCompany;
        private String resolvedCompany;
        private String rawName;
        private String resolvedName;
        private String jobRole;
        private boolean valid;
        private List<String> warnings = new ArrayList<>();
        private String status = "READY";

        public RecipientBuilder id(String id) { this.id = id; return this; }
        public RecipientBuilder email(String email) { this.email = email; return this; }
        public RecipientBuilder rawCompany(String rawCompany) { this.rawCompany = rawCompany; return this; }
        public RecipientBuilder resolvedCompany(String resolvedCompany) { this.resolvedCompany = resolvedCompany; return this; }
        public RecipientBuilder rawName(String rawName) { this.rawName = rawName; return this; }
        public RecipientBuilder resolvedName(String resolvedName) { this.resolvedName = resolvedName; return this; }
        public RecipientBuilder jobRole(String jobRole) { this.jobRole = jobRole; return this; }
        public RecipientBuilder valid(boolean valid) { this.valid = valid; return this; }
        public RecipientBuilder warnings(List<String> warnings) { this.warnings = warnings; return this; }
        public RecipientBuilder status(String status) { this.status = status; return this; }

        public Recipient build() {
            Recipient r = new Recipient();
            r.setId(id);
            r.setEmail(email);
            r.setRawCompany(rawCompany);
            r.setResolvedCompany(resolvedCompany);
            r.setRawName(rawName);
            r.setResolvedName(resolvedName);
            r.setJobRole(jobRole);
            r.setValid(valid);
            r.setWarnings(warnings != null ? warnings : new ArrayList<>());
            r.setStatus(status != null ? status : "READY");
            return r;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRawCompany() { return rawCompany; }
    public void setRawCompany(String rawCompany) { this.rawCompany = rawCompany; }
    public String getResolvedCompany() { return resolvedCompany; }
    public void setResolvedCompany(String resolvedCompany) { this.resolvedCompany = resolvedCompany; }
    public String getRawName() { return rawName; }
    public void setRawName(String rawName) { this.rawName = rawName; }
    public String getResolvedName() { return resolvedName; }
    public void setResolvedName(String resolvedName) { this.resolvedName = resolvedName; }
    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}