package com.doot.doot.service;

import com.doot.doot.model.ResumeInfo;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class ResumeStorageService {

    private final Path uploadDir = Paths.get("uploads", "resume");

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create resume upload directory: " + e.getMessage());
        }
    }

    public ResumeInfo storeResume(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        if (originalName == null || (!originalName.toLowerCase().endsWith(".pdf") && !originalName.toLowerCase().endsWith(".docx"))) {
            throw new IllegalArgumentException("Only PDF or DOCX resume files are supported.");
        }

        // Clean out existing resumes so only 1 active resume file exists
        File dir = uploadDir.toFile();
        File[] existingFiles = dir.listFiles();
        if (existingFiles != null) {
            for (File f : existingFiles) {
                f.delete();
            }
        }

        Path targetPath = uploadDir.resolve(originalName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return getResumeInfo();
    }

    public ResumeInfo getResumeInfo() {
        File dir = uploadDir.toFile();
        File[] files = dir.listFiles();
        if (files == null || files.length == 0) {
            return ResumeInfo.builder()
                    .exists(false)
                    .build();
        }

        File resumeFile = files[0];
        long bytes = resumeFile.length();
        String formattedSize = formatFileSize(bytes);
        LocalDateTime uploadTime = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(resumeFile.lastModified()), ZoneId.systemDefault()
        );

        return ResumeInfo.builder()
                .exists(true)
                .fileName(resumeFile.getName())
                .fileSize(formattedSize)
                .sizeBytes(bytes)
                .uploadedAt(uploadTime)
                .build();
    }

    public File getActiveResumeFile() {
        File dir = uploadDir.toFile();
        File[] files = dir.listFiles();
        if (files == null || files.length == 0) {
            return null;
        }
        return files[0];
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}