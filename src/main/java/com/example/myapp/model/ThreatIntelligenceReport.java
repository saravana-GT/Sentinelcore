package com.example.myapp.model;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreatIntelligenceReport {
    private String ipAddress;
    private String isPublic;
    private String ipVersion;
    private String isWhitelisted;
    private String abuseConfidenceScore;
    private String countryCode;
    private String usageType;
    private String isp;
    private String domain;
    private String totalReports;
    private String numDistinctUsers;
    private String lastReportedAt;
    private ThreatLevel threatLevel;
}
