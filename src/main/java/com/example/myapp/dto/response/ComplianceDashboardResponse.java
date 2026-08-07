package com.example.myapp.dto.response;
import java.util.Map;
public record ComplianceDashboardResponse(double complianceScore, long totalControls, long passedControls, long failedControls, long warningControls, long notApplicableControls, Map<String, Long> frameworkSummary) { }
