package com.doot.doot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeInfo {
    private boolean exists;
    private String fileName;
    private String fileSize;
    private long sizeBytes;
    private LocalDateTime uploadedAt;

    public static ResumeInfoBuilder builder() {
        return new ResumeInfoBuilder();
    }

    public static class ResumeInfoBuilder {
        private boolean exists;
        private String fileName;
        private String fileSize;
        private long sizeBytes;
        private LocalDateTime uploadedAt;

        public ResumeInfoBuilder exists(boolean exists) { this.exists = exists; return this; }
        public ResumeInfoBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public ResumeInfoBuilder fileSize(String fileSize) { this.fileSize = fileSize; return this; }
        public ResumeInfoBuilder sizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; return this; }
        public ResumeInfoBuilder uploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; return this; }

        public ResumeInfo build() {
            ResumeInfo info = new ResumeInfo();
            info.setExists(exists);
            info.setFileName(fileName);
            info.setFileSize(fileSize);
            info.setSizeBytes(sizeBytes);
            info.setUploadedAt(uploadedAt);
            return info;
        }
    }

    public boolean isExists() { return exists; }
    public void setExists(boolean exists) { this.exists = exists; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }
    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}