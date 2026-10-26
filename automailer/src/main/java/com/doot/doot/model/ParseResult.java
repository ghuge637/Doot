package com.doot.doot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParseResult {
    private String fileName;
    private int totalRows;
    private int validCount;
    private int flaggedCount;
    private Map<String, Integer> detectedHeaders;
    
    @Builder.Default
    private List<Recipient> recipients = new ArrayList<>();

    public static ParseResultBuilder builder() {
        return new ParseResultBuilder();
    }

    public static class ParseResultBuilder {
        private String fileName;
        private int totalRows;
        private int validCount;
        private int flaggedCount;
        private Map<String, Integer> detectedHeaders;
        private List<Recipient> recipients = new ArrayList<>();

        public ParseResultBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public ParseResultBuilder totalRows(int totalRows) { this.totalRows = totalRows; return this; }
        public ParseResultBuilder validCount(int validCount) { this.validCount = validCount; return this; }
        public ParseResultBuilder flaggedCount(int flaggedCount) { this.flaggedCount = flaggedCount; return this; }
        public ParseResultBuilder detectedHeaders(Map<String, Integer> detectedHeaders) { this.detectedHeaders = detectedHeaders; return this; }
        public ParseResultBuilder recipients(List<Recipient> recipients) { this.recipients = recipients; return this; }

        public ParseResult build() {
            ParseResult r = new ParseResult();
            r.setFileName(fileName);
            r.setTotalRows(totalRows);
            r.setValidCount(validCount);
            r.setFlaggedCount(flaggedCount);
            r.setDetectedHeaders(detectedHeaders);
            r.setRecipients(recipients != null ? recipients : new ArrayList<>());
            return r;
        }
    }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }
    public int getValidCount() { return validCount; }
    public void setValidCount(int validCount) { this.validCount = validCount; }
    public int getFlaggedCount() { return flaggedCount; }
    public void setFlaggedCount(int flaggedCount) { this.flaggedCount = flaggedCount; }
    public Map<String, Integer> getDetectedHeaders() { return detectedHeaders; }
    public void setDetectedHeaders(Map<String, Integer> detectedHeaders) { this.detectedHeaders = detectedHeaders; }
    public List<Recipient> getRecipients() { return recipients; }
    public void setRecipients(List<Recipient> recipients) { this.recipients = recipients; }
}