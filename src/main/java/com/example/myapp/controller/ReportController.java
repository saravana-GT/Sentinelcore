package com.example.myapp.controller;

import com.example.myapp.service.EnterpriseReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private EnterpriseReportService reportService;

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> getPdfReport(@RequestParam(defaultValue = "SOC") String type) {
        byte[] pdfBytes = reportService.generatePdfReport(type);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"sentinelcore-" + type.toLowerCase() + "-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/csv")
    public ResponseEntity<String> getCsvReport(@RequestParam(defaultValue = "ASSETS") String type) {
        String csvData = reportService.generateCsvReport(type);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"sentinelcore-" + type.toLowerCase() + "-export.csv\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csvData);
    }

    @GetMapping("/excel")
    public ResponseEntity<String> getExcelReport(@RequestParam(defaultValue = "ASSETS") String type) {
        String excelXml = reportService.generateExcelXmlReport(type);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"sentinelcore-" + type.toLowerCase() + "-export.xml\"")
                .contentType(MediaType.APPLICATION_XML)
                .body(excelXml);
    }

    @GetMapping("/executive-summary")
    public ResponseEntity<Map<String, Object>> getExecutiveSummary() {
        return ResponseEntity.ok(reportService.getExecutiveSummaryMetrics());
    }
}
