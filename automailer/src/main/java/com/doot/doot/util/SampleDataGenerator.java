package com.doot.doot.util;

import jakarta.annotation.PostConstruct;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class SampleDataGenerator {

    @PostConstruct
    public void generateSampleFiles() {
        try {
            Path targetXlsx = Paths.get("..", "sample_recruiters.xlsx");
            if (!Files.exists(targetXlsx)) {
                try (Workbook workbook = new XSSFWorkbook();
                     FileOutputStream fos = new FileOutputStream(targetXlsx.toFile())) {
                    Sheet sheet = workbook.createSheet("Recruiters");

                    // Header row
                    Row header = sheet.createRow(0);
                    header.createCell(0).setCellValue("Recruiter Name");
                    header.createCell(1).setCellValue("Company");
                    header.createCell(2).setCellValue("Email");
                    header.createCell(3).setCellValue("Role");

                    // Row 1: Fully filled
                    Row r1 = sheet.createRow(1);
                    r1.createCell(0).setCellValue("Alex Rivera");
                    r1.createCell(1).setCellValue("Google");
                    r1.createCell(2).setCellValue("alex.rivera.tech@gmail.com");
                    r1.createCell(3).setCellValue("Senior Java Developer");

                    // Row 2: Missing Recruiter Name (Fallback: "Hiring Team")
                    Row r2 = sheet.createRow(2);
                    r2.createCell(0).setCellValue("");
                    r2.createCell(1).setCellValue("Microsoft");
                    r2.createCell(2).setCellValue("hiring.msft@outlook.com");
                    r2.createCell(3).setCellValue("Full Stack Engineer");

                    // Row 3: Missing Company Name (Auto-inferred from domain as 'Techstartup' or fallback 'your company')
                    Row r3 = sheet.createRow(3);
                    r3.createCell(0).setCellValue("Sarah Jenkins");
                    r3.createCell(1).setCellValue("");
                    r3.createCell(2).setCellValue("sarah.jenkins@techstartup.io");
                    r3.createCell(3).setCellValue("Backend Engineer");

                    // Row 4: Invalid Email format (Filtered out)
                    Row r4 = sheet.createRow(4);
                    r4.createCell(0).setCellValue("David Vance");
                    r4.createCell(1).setCellValue("Amazon");
                    r4.createCell(2).setCellValue("invalid-email-address");
                    r4.createCell(3).setCellValue("Cloud Engineer");

                    // Row 5: Duplicate contact (Filtered out)
                    Row r5 = sheet.createRow(5);
                    r5.createCell(0).setCellValue("Sarah Jenkins");
                    r5.createCell(1).setCellValue("");
                    r5.createCell(2).setCellValue("sarah.jenkins@techstartup.io");
                    r5.createCell(3).setCellValue("Backend Engineer");

                    // Row 6: Valid contact
                    Row r6 = sheet.createRow(6);
                    r6.createCell(0).setCellValue("Emily Watson");
                    r6.createCell(1).setCellValue("Stripe");
                    r6.createCell(2).setCellValue("emily.watson.careers@gmail.com");
                    r6.createCell(3).setCellValue("Software Engineer");

                    workbook.write(fos);
                }
            }

            // Create sample resume file
            Path targetResume = Paths.get("..", "sample_resume.pdf");
            if (!Files.exists(targetResume)) {
                // Minimal valid PDF binary header & content
                String minimalPdf = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n";
                Files.write(targetResume, minimalPdf.getBytes(StandardCharsets.ISO_8859_1));
            }

        } catch (Exception e) {
            // Non-critical, ignore if unable to generate sample files
        }
    }
}