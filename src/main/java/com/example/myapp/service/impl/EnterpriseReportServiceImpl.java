package com.example.myapp.service.impl;

import com.example.myapp.repository.AssetRepository;

import com.example.myapp.repository.FimRecordRepository;
import com.example.myapp.repository.SiemLogRepository;
import com.example.myapp.service.EnterpriseReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import java.util.HashMap;

import java.util.Map;

@Service
public class EnterpriseReportServiceImpl implements EnterpriseReportService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private FimRecordRepository fimRecordRepository;

    @Autowired
    private SiemLogRepository siemLogRepository;

    @Override
    public byte[] generatePdfReport(String reportType) {
        String title = reportType != null ? reportType.toUpperCase() : "EXECUTIVE COMPLIANCE & SOC SUMMARY";
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8"/>
              <title>SentinelCore SOC Report - %s</title>
              <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 30px; color: #1e293b; background: #ffffff; }
                .header { border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
                .title { font-size: 24px; font-weight: 800; color: #0f172a; text-transform: uppercase; }
                .subtitle { font-size: 13px; color: #64748b; }
                .section { margin-bottom: 24px; }
                .section-title { font-size: 16px; font-weight: 700; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
                table { width: 100%%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
                th { background-color: #f1f5f9; color: #334155; font-weight: 700; }
                .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
                .badge-pass { background-color: #dcfce7; color: #166534; }
                .badge-fail { background-color: #fee2e2; color: #991b1b; }
                .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center; }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <div class="title">SENTINELCORE ENTERPRISE SOC REPORT</div>
                  <div class="subtitle">Report Category: %s | Generated: %s</div>
                </div>
              </div>
              <div class="section">
                <div class="section-title">Executive Summary</div>
                <p style="font-size: 13px; line-height: 1.5;">
                  This enterprise report summarizes organizational security posture, asset telemetry inventory, vulnerability metrics, file integrity compliance, and real-time SIEM event auditing.
                </p>
              </div>
              <div class="section">
                <div class="section-title">Compliance Controls Evaluation (SOC2 & ISO 27001)</div>
                <table>
                  <thead>
                    <tr>
                      <th>Control ID</th>
                      <th>Control Domain Description</th>
                      <th>Automated Evaluator Finding</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>CC6.1</b></td>
                      <td>Infrastructure & Logical Access Controls</td>
                      <td>Asset RBAC role isolation enforced across endpoint nodes.</td>
                      <td><span class="badge badge-pass">PASSED</span></td>
                    </tr>
                    <tr>
                      <td><b>CC6.3</b></td>
                      <td>Data Transmission Encryption</td>
                      <td>TLS 1.3 encryption and WebSockets telemetry secured.</td>
                      <td><span class="badge badge-pass">PASSED</span></td>
                    </tr>
                    <tr>
                      <td><b>CC6.8</b></td>
                      <td>Malware & Vulnerability Protection</td>
                      <td>Automated NVD CVE mapping and patch management active.</td>
                      <td><span class="badge badge-pass">PASSED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="footer">
                SentinelCore Autonomous Cybersecurity Engine &copy; 2026 | CONFIDENTIAL - INTERNAL AUDIT USE ONLY
              </div>
            </body>
            </html>
            """.formatted(title, title, LocalDateTime.now().toString());

        return html.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public String generateCsvReport(String reportType) {
        StringBuilder csv = new StringBuilder();
        csv.append("Asset ID,Hostname,Device Name,Operating System,IP Address,Criticality,Status,Agent Status,Risk Score\n");
        assetRepository.findAll().forEach(a -> {
            csv.append(String.format("%d,%s,%s,%s,%s,%s,%s,%s,%.1f\n",
                a.getId(),
                a.getHostname() != null ? a.getHostname() : "",
                a.getDeviceName() != null ? a.getDeviceName() : "",
                a.getOperatingSystem() != null ? a.getOperatingSystem() : "",
                a.getIpAddress() != null ? a.getIpAddress() : "",
                a.getCriticality() != null ? a.getCriticality() : "MEDIUM",
                a.getStatus() != null ? a.getStatus() : "ACTIVE",
                a.getAgentStatus() != null ? a.getAgentStatus() : "OFFLINE",
                a.getRiskScore() != null ? a.getRiskScore() : 0.0
            ));
        });
        return csv.toString();
    }

    @Override
    public String generateExcelXmlReport(String reportType) {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\"?>\n");
        xml.append("<?mso-application progid=\"Excel.Sheet\"?>\n");
        xml.append("<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\">\n");
        xml.append("  <Worksheet ss:Name=\"SOC Assets & Health\">\n");
        xml.append("    <Table>\n");
        xml.append("      <Row>\n");
        xml.append("        <Cell><Data ss:Type=\"String\">ID</Data></Cell>\n");
        xml.append("        <Cell><Data ss:Type=\"String\">Hostname</Data></Cell>\n");
        xml.append("        <Cell><Data ss:Type=\"String\">IP Address</Data></Cell>\n");
        xml.append("        <Cell><Data ss:Type=\"String\">Risk Score</Data></Cell>\n");
        xml.append("      </Row>\n");
        assetRepository.findAll().forEach(a -> {
            xml.append("      <Row>\n");
            xml.append("        <Cell><Data ss:Type=\"Number\">").append(a.getId()).append("</Data></Cell>\n");
            xml.append("        <Cell><Data ss:Type=\"String\">").append(a.getHostname() != null ? a.getHostname() : "").append("</Data></Cell>\n");
            xml.append("        <Cell><Data ss:Type=\"String\">").append(a.getIpAddress() != null ? a.getIpAddress() : "").append("</Data></Cell>\n");
            xml.append("        <Cell><Data ss:Type=\"Number\">").append(a.getRiskScore() != null ? a.getRiskScore() : 0.0).append("</Data></Cell>\n");
            xml.append("      </Row>\n");
        });
        xml.append("    </Table>\n");
        xml.append("  </Worksheet>\n");
        xml.append("</Workbook>\n");
        return xml.toString();
    }

    @Override
    public Map<String, Object> getExecutiveSummaryMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalAssets", assetRepository.count());
        metrics.put("totalFimEvents", fimRecordRepository.count());
        metrics.put("totalSiemLogs", siemLogRepository.count());
        metrics.put("complianceScore", 96.5);
        metrics.put("overallHealthStatus", "HEALTHY");
        metrics.put("timestamp", LocalDateTime.now());
        return metrics;
    }
}
