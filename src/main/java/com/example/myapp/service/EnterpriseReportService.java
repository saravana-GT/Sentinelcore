package com.example.myapp.service;

import java.util.Map;

public interface EnterpriseReportService {

    byte[] generatePdfReport(String reportType);

    String generateCsvReport(String reportType);

    String generateExcelXmlReport(String reportType);

    Map<String, Object> getExecutiveSummaryMetrics();
}
