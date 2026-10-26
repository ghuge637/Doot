package com.doot.doot.service;

import com.doot.doot.model.ParseResult;
import com.doot.doot.model.Recipient;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.*;

class ExcelParserServiceTest {

    private final ExcelParserService parserService = new ExcelParserService();

    @Test
    void testExcelParsingWithEdgeCases() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Recruiters");

            // Header row
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Recruiter Name");
            header.createCell(1).setCellValue("Company");
            header.createCell(2).setCellValue("Email");
            header.createCell(3).setCellValue("Role");

            // Row 1: Fully valid
            Row r1 = sheet.createRow(1);
            r1.createCell(0).setCellValue("Alex John");
            r1.createCell(1).setCellValue("TechCorp");
            r1.createCell(2).setCellValue("alex@techcorp.io");
            r1.createCell(3).setCellValue("Java Engineer");

            // Row 2: Missing company with corporate domain (Inferred: "Company")
            Row r2 = sheet.createRow(2);
            r2.createCell(0).setCellValue("Sarah Connor");
            r2.createCell(1).setCellValue(""); // Blank company
            r2.createCell(2).setCellValue("sarah@company.com");
            r2.createCell(3).setCellValue("Backend Engineer");

            // Row 3: Missing recruiter name (Fallback: "Hiring Team")
            Row r3 = sheet.createRow(3);
            r3.createCell(0).setCellValue(""); // Blank recruiter name
            r3.createCell(1).setCellValue("StartupCo");
            r3.createCell(2).setCellValue("hiring@startup.co");
            r3.createCell(3).setCellValue("Full Stack Engineer");

            // Row 4: Invalid email format (Filtered out)
            Row r4 = sheet.createRow(4);
            r4.createCell(0).setCellValue("Bob Vance");
            r4.createCell(1).setCellValue("Vance Corp");
            r4.createCell(2).setCellValue("not-an-email");
            r4.createCell(3).setCellValue("Tester");

            // Row 5: Duplicate email (Filtered out)
            Row r5 = sheet.createRow(5);
            r5.createCell(0).setCellValue("Duplicate Alex");
            r5.createCell(1).setCellValue("TechCorp");
            r5.createCell(2).setCellValue("alex@techcorp.io");
            r5.createCell(3).setCellValue("Lead Developer");

            // Row 6: Missing company with Gmail address (Fallback: "your company")
            Row r6 = sheet.createRow(6);
            r6.createCell(0).setCellValue("Emily Stone");
            r6.createCell(1).setCellValue("");
            r6.createCell(2).setCellValue("emily.stone@gmail.com");
            r6.createCell(3).setCellValue("DevOps Engineer");

            workbook.write(baos);
        }

        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "recruiters_test.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                baos.toByteArray()
        );

        ParseResult result = parserService.parseFile(mockFile);

        assertNotNull(result);
        assertEquals(6, result.getTotalRows());
        assertEquals(4, result.getValidCount());
        assertEquals(2, result.getFlaggedCount());

        // Check Row 1: Completely valid
        Recipient rec1 = result.getRecipients().get(0);
        assertEquals("alex@techcorp.io", rec1.getEmail());
        assertEquals("TechCorp", rec1.getResolvedCompany());
        assertEquals("Alex John", rec1.getResolvedName());
        assertTrue(rec1.isValid());

        // Check Row 2: Inferred company from corporate domain
        Recipient rec2 = result.getRecipients().get(1);
        assertEquals("sarah@company.com", rec2.getEmail());
        assertEquals("Company", rec2.getResolvedCompany());
        assertEquals("Sarah Connor", rec2.getResolvedName());
        assertTrue(rec2.isValid());
        assertTrue(rec2.getWarnings().stream().anyMatch(w -> w.contains("Company inferred from email domain")));

        // Check Row 3: Fallback for missing name
        Recipient rec3 = result.getRecipients().get(2);
        assertEquals("hiring@startup.co", rec3.getEmail());
        assertEquals("StartupCo", rec3.getResolvedCompany());
        assertEquals("Hiring Team", rec3.getResolvedName());
        assertTrue(rec3.isValid());
        assertTrue(rec3.getWarnings().stream().anyMatch(w -> w.contains("Recruiter name missing")));

        // Check Row 4: Invalid email flagged
        Recipient rec4 = result.getRecipients().get(3);
        assertFalse(rec4.isValid());
        assertEquals("SKIPPED", rec4.getStatus());
        assertTrue(rec4.getWarnings().stream().anyMatch(w -> w.contains("Invalid email format")));

        // Check Row 5: Duplicate flagged
        Recipient rec5 = result.getRecipients().get(4);
        assertFalse(rec5.isValid());
        assertEquals("SKIPPED", rec5.getStatus());
        assertTrue(rec5.getWarnings().stream().anyMatch(w -> w.contains("Duplicate email in file")));

        // Check Row 6: Natural fallback "your company" for public email domain
        Recipient rec6 = result.getRecipients().get(5);
        assertEquals("emily.stone@gmail.com", rec6.getEmail());
        assertEquals("your company", rec6.getResolvedCompany());
        assertEquals("Emily Stone", rec6.getResolvedName());
        assertTrue(rec6.isValid());
        assertTrue(rec6.getWarnings().stream().anyMatch(w -> w.contains("Natural fallback applied")));
    }

    @Test
    void testExtractCompanyFromEmail() {
        assertEquals("Microsoft", ExcelParserService.extractCompanyFromEmail("recruiter@microsoft.com"));
        assertEquals("Stripe", ExcelParserService.extractCompanyFromEmail("talent@stripe.com"));
        assertEquals("Airbnb", ExcelParserService.extractCompanyFromEmail("hr@careers.airbnb.com"));
        assertEquals("Swiggy", ExcelParserService.extractCompanyFromEmail("jobs@swiggy.in"));
        assertNull(ExcelParserService.extractCompanyFromEmail("john@gmail.com"));
        assertNull(ExcelParserService.extractCompanyFromEmail("sarah@outlook.com"));
    }
}