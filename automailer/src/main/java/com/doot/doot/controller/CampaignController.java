package com.doot.doot.controller;

import com.doot.doot.model.Recipient;
import com.doot.doot.service.SseProgressService;
import com.doot.doot.service.ThrottledQueueEngine;
import lombok.Data;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campaign")
public class CampaignController {

    private final ThrottledQueueEngine throttledQueueEngine;
    private final SseProgressService sseProgressService;

    public CampaignController(ThrottledQueueEngine throttledQueueEngine, SseProgressService sseProgressService) {
        this.throttledQueueEngine = throttledQueueEngine;
        this.sseProgressService = sseProgressService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamCampaignEvents() {
        return sseProgressService.subscribe();
    }

    @GetMapping("/status")
    public ResponseEntity<ThrottledQueueEngine.CampaignStatus> getStatus() {
        return ResponseEntity.ok(throttledQueueEngine.getStatus());
    }

    @PostMapping("/start")
    public ResponseEntity<?> startCampaign(@RequestBody StartCampaignRequest request) {
        try {
            int minDelay = request.getMinDelay() > 0 ? request.getMinDelay() : 15;
            int maxDelay = request.getMaxDelay() > 0 ? request.getMaxDelay() : 30;

            throttledQueueEngine.startCampaign(
                    request.getRecipients(),
                    request.getSubjectTemplate(),
                    request.getBodyTemplate(),
                    minDelay,
                    maxDelay
            );
            return ResponseEntity.ok(Map.of("message", "Campaign launched successfully."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error starting campaign: " + e.getMessage()));
        }
    }

    @PostMapping("/pause")
    public ResponseEntity<?> pauseCampaign() {
        throttledQueueEngine.pauseCampaign();
        return ResponseEntity.ok(Map.of("message", "Campaign paused."));
    }

    @PostMapping("/resume")
    public ResponseEntity<?> resumeCampaign() {
        throttledQueueEngine.resumeCampaign();
        return ResponseEntity.ok(Map.of("message", "Campaign resumed."));
    }

    @PostMapping("/stop")
    public ResponseEntity<?> stopCampaign() {
        throttledQueueEngine.stopCampaign();
        return ResponseEntity.ok(Map.of("message", "Campaign stopped."));
    }

    @Data
    public static class StartCampaignRequest {
        private List<Recipient> recipients;
        private String subjectTemplate;
        private String bodyTemplate;
        private int minDelay = 15;
        private int maxDelay = 30;

        public StartCampaignRequest() {}

        public List<Recipient> getRecipients() {
            return recipients;
        }

        public void setRecipients(List<Recipient> recipients) {
            this.recipients = recipients;
        }

        public String getSubjectTemplate() {
            return subjectTemplate;
        }

        public void setSubjectTemplate(String subjectTemplate) {
            this.subjectTemplate = subjectTemplate;
        }

        public String getBodyTemplate() {
            return bodyTemplate;
        }

        public void setBodyTemplate(String bodyTemplate) {
            this.bodyTemplate = bodyTemplate;
        }

        public int getMinDelay() {
            return minDelay;
        }

        public void setMinDelay(int minDelay) {
            this.minDelay = minDelay;
        }

        public int getMaxDelay() {
            return maxDelay;
        }

        public void setMaxDelay(int maxDelay) {
            this.maxDelay = maxDelay;
        }
    }
}