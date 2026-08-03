package com.example.myapp.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AbuseIPDBDataDTO {

    @JsonProperty("ipAddress")
    private String ipAddress;

    @JsonProperty("isPublic")
    private Boolean isPublic;

    @JsonProperty("ipVersion")
    private Integer ipVersion;

    @JsonProperty("isWhitelisted")
    private Boolean isWhitelisted;

    @JsonProperty("abuseConfidenceScore")
    private Integer abuseConfidenceScore;

    @JsonProperty("countryCode")
    private String countryCode;

    @JsonProperty("usageType")
    private String usageType;

    @JsonProperty("isp")
    private String isp;

    @JsonProperty("domain")
    private String domain;

    @JsonProperty("totalReports")
    private Integer totalReports;

    @JsonProperty("numDistinctUsers")
    private Integer numDistinctUsers;

    @JsonProperty("lastReportedAt")
    private String lastReportedAt;
}
