package com.doot.doot.controller;

import com.doot.doot.model.ResumeInfo;
import com.doot.doot.service.ResumeStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeStorageService resumeStorageService;

    public ResumeController(ResumeStorageService resumeStorageService) {
        this.resumeStorageService = resumeStorageService;
    }

    @GetMapping("/info")
    public ResponseEntity<ResumeInfo> getResumeInfo() {
        return ResponseEntity.ok(resumeStorageService.getResumeInfo());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty."));
        }

        try {
            ResumeInfo info = resumeStorageService.storeResume(file);
            return ResponseEntity.ok(info);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to store resume: " + e.getMessage()));
        }
    }
}