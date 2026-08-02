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
    private String isPublic;       // "Yes" / "No"
    private String ipVersion;      // "IPv4" / "IPv6"
    private String isWhitelisted;  // "Yes" / "No"
    private String abuseConfidenceScore; // "0%", "25%", etc.
    private String countryCode;
    private String usageType;
    private String ispName;
    private String domainName;
    private int totalReports;
    private int distinctReporters;
    private String lastReportedAt;
    private ThreatLevel threatLevel;
}
