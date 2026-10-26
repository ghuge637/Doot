package com.doot.doot.service;

import com.doot.doot.model.ParseResult;
import com.doot.doot.model.Recipient;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ExcelParserService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private static final Set<String> PUBLIC_EMAIL_DOMAINS = Set.of(
            "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "yahoo.co.uk",
            "outlook.com", "hotmail.com", "live.com", "msn.com",
            "icloud.com", "me.com", "mac.com",
            "aol.com", "zoho.com", "zoho.in", "proton.me", "protonmail.com",
            "mail.com", "gmx.com", "yandex.com", "rediffmail.com"
    );

    private static final String DEFAULT_COMPANY_FALLBACK = "your company";
    private static final String DEFAULT_NAME_FALLBACK = "Hiring Team";
    private static final String DEFAULT_ROLE_FALLBACK = "Software Developer";

    public ParseResult parseFile(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            return parseExcel(file);
        } else if (filename.endsWith(".csv")) {
            return parseCsv(file);
        } else {
            throw new IllegalArgumentException("Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV file.");
        }
    }

    private ParseResult parseExcel(MultipartFile file) throws Exception {
        List<Recipient> recipients = new ArrayList<>();
        Map<String, Integer> headerMap = new HashMap<>();
        Set<String> seenEmails = new HashSet<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getPhysicalNumberOfRows() == 0) {
                return ParseResult.builder()
                        .fileName(file.getOriginalFilename())
                        .totalRows(0)
                        .validCount(0)
                        .flaggedCount(0)
                        .recipients(Collections.emptyList())
                        .build();
            }

            // Find header row
            Row headerRow = null;
            int headerRowIndex = 0;
            for (int r = 0; r <= Math.min(10, sheet.getLastRowNum()); r++) {
                Row rRow = sheet.getRow(r);
                if (rRow != null && hasEmailHeader(rRow)) {
                    headerRow = rRow;
                    headerRowIndex = r;
                    break;
                }
            }

            if (headerRow == null) {
                // Default to row 0 if no clear email header found
                headerRow = sheet.getRow(0);
                headerRowIndex = 0;
            }

            headerMap = mapHeaders(headerRow);
            int emailCol = headerMap.getOrDefault("email", 0);
            int companyCol = headerMap.getOrDefault("company", -1);
            int nameCol = headerMap.getOrDefault("name", -1);
            int roleCol = headerMap.getOrDefault("role", -1);

            int totalRows = 0;
            int validCount = 0;
            int flaggedCount = 0;

            DataFormatter formatter = new DataFormatter();

            for (int r = headerRowIndex + 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                String email = getCellValue(row, emailCol, formatter).trim();
                String rawCompany = companyCol != -1 ? getCellValue(row, companyCol, formatter).trim() : "";
                String rawName = nameCol != -1 ? getCellValue(row, nameCol, formatter).trim() : "";
                String rawRole = roleCol != -1 ? getCellValue(row, roleCol, formatter).trim() : "";

                // Skip entirely empty rows
                if (email.isEmpty() && rawCompany.isEmpty() && rawName.isEmpty()) {
                    continue;
                }

                totalRows++;
                Recipient recipient = processContact(
                        "row_" + totalRows, email, rawCompany, rawName, rawRole, seenEmails
                );

                if (recipient.isValid()) {
                    validCount++;
                } else {
                    flaggedCount++;
                }
                recipients.add(recipient);
            }

            return ParseResult.builder()
                    .fileName(file.getOriginalFilename())
                    .totalRows(totalRows)
                    .validCount(validCount)
                    .flaggedCount(flaggedCount)
                    .detectedHeaders(headerMap)
                    .recipients(recipients)
                    .build();
        }
    }

    private ParseResult parseCsv(MultipartFile file) throws Exception {
        List<Recipient> recipients = new ArrayList<>();
        Set<String> seenEmails = new HashSet<>();
        Map<String, Integer> headerMap = new HashMap<>();

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).build());
            
            Map<String, Integer> rawHeaderMap = csvParser.getHeaderMap();
            int emailCol = findColumnIndex(rawHeaderMap, "email", "mail", "contact");
            int companyCol = findColumnIndex(rawHeaderMap, "company", "organization", "firm", "corp");
            int nameCol = findColumnIndex(rawHeaderMap, "name", "recruiter", "hr", "person");
            int roleCol = findColumnIndex(rawHeaderMap, "role", "position", "title", "job");

            headerMap.put("email", emailCol);
            headerMap.put("company", companyCol);
            headerMap.put("name", nameCol);
            headerMap.put("role", roleCol);

            int totalRows = 0;
            int validCount = 0;
            int flaggedCount = 0;

            for (CSVRecord record : csvParser) {
                String email = emailCol != -1 && emailCol < record.size() ? record.get(emailCol).trim() : "";
                String rawCompany = companyCol != -1 && companyCol < record.size() ? record.get(companyCol).trim() : "";
                String rawName = nameCol != -1 && nameCol < record.size() ? record.get(nameCol).trim() : "";
                String rawRole = roleCol != -1 && roleCol < record.size() ? record.get(roleCol).trim() : "";

                if (email.isEmpty() && rawCompany.isEmpty() && rawName.isEmpty()) {
                    continue;
                }

                totalRows++;
                Recipient recipient = processContact(
                        "csv_" + totalRows, email, rawCompany, rawName, rawRole, seenEmails
                );

                if (recipient.isValid()) {
                    validCount++;
                } else {
                    flaggedCount++;
                }
                recipients.add(recipient);
            }

            return ParseResult.builder()
                    .fileName(file.getOriginalFilename())
                    .totalRows(totalRows)
                    .validCount(validCount)
                    .flaggedCount(flaggedCount)
                    .detectedHeaders(headerMap)
                    .recipients(recipients)
                    .build();
        }
    }

    private Recipient processContact(String id, String email, String rawCompany, String rawName, String rawRole, Set<String> seenEmails) {
        List<String> warnings = new ArrayList<>();
        boolean valid = true;
        String status = "READY";

        // Email validation
        if (email.isEmpty()) {
            valid = false;
            status = "SKIPPED";
            warnings.add("Missing email address");
        } else if (!EMAIL_PATTERN.matcher(email).matches()) {
            valid = false;
            status = "SKIPPED";
            warnings.add("Invalid email format (" + email + ")");
        } else if (seenEmails.contains(email.toLowerCase())) {
            valid = false;
            status = "SKIPPED";
            warnings.add("Duplicate email in file");
        } else {
            seenEmails.add(email.toLowerCase());
        }

        // Company Edge Case Fallback with Domain Inference
        String resolvedCompany;
        if (rawCompany.isEmpty()) {
            String inferred = extractCompanyFromEmail(email);
            if (inferred != null && !inferred.isEmpty()) {
                resolvedCompany = inferred;
                if (valid) {
                    warnings.add("Company inferred from email domain ('" + inferred + "')");
                }
            } else {
                resolvedCompany = DEFAULT_COMPANY_FALLBACK;
                if (valid) {
                    warnings.add("Company name missing (Natural fallback applied: '" + DEFAULT_COMPANY_FALLBACK + "')");
                }
            }
        } else {
            resolvedCompany = rawCompany;
        }

        // Recruiter Name Edge Case Fallback
        String resolvedName;
        if (rawName.isEmpty()) {
            resolvedName = DEFAULT_NAME_FALLBACK;
            if (valid) {
                warnings.add("Recruiter name missing (Fallback applied: '" + DEFAULT_NAME_FALLBACK + "')");
            }
        } else {
            resolvedName = rawName;
        }

        // Job Role Fallback
        String resolvedRole = rawRole.isEmpty() ? DEFAULT_ROLE_FALLBACK : rawRole;

        return Recipient.builder()
                .id(id)
                .email(email)
                .rawCompany(rawCompany)
                .resolvedCompany(resolvedCompany)
                .rawName(rawName)
                .resolvedName(resolvedName)
                .jobRole(resolvedRole)
                .valid(valid)
                .warnings(warnings)
                .status(status)
                .build();
    }

    private boolean hasEmailHeader(Row row) {
        DataFormatter formatter = new DataFormatter();
        for (Cell cell : row) {
            String val = formatter.formatCellValue(cell).toLowerCase();
            if (val.contains("email") || val.contains("mail")) {
                return true;
            }
        }
        return false;
    }

    private Map<String, Integer> mapHeaders(Row headerRow) {
        Map<String, Integer> map = new HashMap<>();
        DataFormatter formatter = new DataFormatter();
        if (headerRow == null) return map;

        for (int c = 0; c < headerRow.getLastCellNum(); c++) {
            Cell cell = headerRow.getCell(c);
            if (cell == null) continue;
            String text = formatter.formatCellValue(cell).trim().toLowerCase();

            if (text.contains("email") || text.contains("mail") || text.contains("contact")) {
                map.putIfAbsent("email", c);
            } else if (text.contains("company") || text.contains("org") || text.contains("firm") || text.contains("corp") || text.contains("employer")) {
                map.putIfAbsent("company", c);
            } else if (text.contains("name") || text.contains("recruiter") || text.contains("hr") || text.contains("person")) {
                map.putIfAbsent("name", c);
            } else if (text.contains("role") || text.contains("position") || text.contains("title") || text.contains("job")) {
                map.putIfAbsent("role", c);
            }
        }
        return map;
    }

    private int findColumnIndex(Map<String, Integer> map, String... keywords) {
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            String key = entry.getKey().toLowerCase();
            for (String kw : keywords) {
                if (key.contains(kw)) {
                    return entry.getValue();
                }
            }
        }
        return -1;
    }

    private String getCellValue(Row row, int colIndex, DataFormatter formatter) {
        if (colIndex < 0) return "";
        Cell cell = row.getCell(colIndex);
        return formatter.formatCellValue(cell);
    }

    public static String extractCompanyFromEmail(String email) {
        if (email == null || !email.contains("@")) return null;
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase().trim();
        if (domain.isEmpty() || PUBLIC_EMAIL_DOMAINS.contains(domain)) {
            return null;
        }

        String[] parts = domain.split("\\.");
        if (parts.length == 0) return null;

        String brandPart = parts[0];
        if ((brandPart.equals("careers") || brandPart.equals("jobs") || brandPart.equals("talent")
                || brandPart.equals("mail") || brandPart.equals("recruiting")) && parts.length > 2) {
            brandPart = parts[1];
        }

        if (brandPart.length() < 2) return null;

        StringBuilder sb = new StringBuilder();
        String[] words = brandPart.split("[-_]");
        for (int i = 0; i < words.length; i++) {
            String w = words[i];
            if (!w.isEmpty()) {
                if (i > 0) sb.append(" ");
                sb.append(Character.toUpperCase(w.charAt(0)));
                if (w.length() > 1) {
                    sb.append(w.substring(1));
                }
            }
        }
        return sb.length() > 0 ? sb.toString() : null;
    }
}