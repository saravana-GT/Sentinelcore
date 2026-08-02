package com.example.myapp.dto;

import lombok.Data;

@Data
public class AbuseIPDBDataDTO {
    private String ipAddress;
    private boolean isPublic;
    private int ipVersion;
    private boolean isWhitelisted;
    private int abuseConfidenceScore;
    private String countryCode;
    private String usageType;
    private String isp;
    private String domain;
    private int totalReports;
    private int numDistinctUsers;
    private String lastReportedAt;
}
