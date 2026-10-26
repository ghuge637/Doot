package com.doot.doot.controller;

import com.doot.doot.model.ParseResult;
import com.doot.doot.service.ExcelParserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ExcelParserService excelParserService;

    public ContactController(ExcelParserService excelParserService) {
        this.excelParserService = excelParserService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadContacts(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty. Please select a valid Excel or CSV file."));
        }

        try {
            ParseResult result = excelParserService.parseFile(file);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to parse contact file: " + e.getMessage()));
        }
    }
}