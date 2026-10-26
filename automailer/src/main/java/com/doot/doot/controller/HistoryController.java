package com.doot.doot.controller;

import com.doot.doot.entity.ApplicationLog;
import com.doot.doot.repository.ApplicationLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final ApplicationLogRepository applicationLogRepository;

    public HistoryController(ApplicationLogRepository applicationLogRepository) {
        this.applicationLogRepository = applicationLogRepository;
    }

    @GetMapping
    public ResponseEntity<List<ApplicationLog>> getHistory() {
        return ResponseEntity.ok(applicationLogRepository.findAllByOrderBySentAtDesc());
    }

    @DeleteMapping
    public ResponseEntity<?> clearHistory() {
        applicationLogRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "History cleared."));
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkDuplicate(@RequestParam("email") String email) {
        boolean exists = applicationLogRepository.existsByRecipientEmailIgnoreCaseAndStatus(email, "SENT");
        return ResponseEntity.ok(Map.of("alreadyContacted", exists));
    }
}