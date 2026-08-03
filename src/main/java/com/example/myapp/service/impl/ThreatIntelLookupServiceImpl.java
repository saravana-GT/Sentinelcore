package com.example.myapp.service.impl;

import com.example.myapp.config.AbuseIPDBConfig;
import com.example.myapp.dto.AbuseIPDBDataDTO;
import com.example.myapp.dto.AbuseIPDBResponseDTO;
import com.example.myapp.exception.ThreatIntelligenceException;
import com.example.myapp.model.ThreatIntelligenceReport;
import com.example.myapp.model.ThreatLevel;
import com.example.myapp.service.ThreatIntelLookupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.net.InetAddress;
import java.net.UnknownHostException;

@Service
public class ThreatIntelLookupServiceImpl implements ThreatIntelLookupService {

    private static final Logger log = LoggerFactory.getLogger(ThreatIntelLookupServiceImpl.class);

    private final WebClient webClient;
    private final AbuseIPDBConfig apiConfig;

    public ThreatIntelLookupServiceImpl(WebClient webClient, AbuseIPDBConfig apiConfig) {
        this.webClient = webClient;
        this.apiConfig = apiConfig;
    }

    @Override
    public ThreatIntelligenceReport checkIpReputation(String ipAddress) {
        log.info("[*] Received reputation lookup request for IP: {}", ipAddress);

        if (ipAddress == null || ipAddress.trim().isEmpty()) {
            throw new ThreatIntelligenceException("Invalid IP Address");
        }

        String targetIp = ipAddress.trim();

        if (!isValidIp(targetIp)) {
            log.warn("[-] IP Address validation failed for input: {}", targetIp);
            throw new IllegalArgumentException("Invalid IP address. Please enter a valid IPv4 or IPv6 address.");
        }

        String apiKey = apiConfig.getApiKey();

        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("[!] AbuseIPDB API key not configured. Returning mock threat report.");
            return generateMockReport(targetIp);
        }

        log.info("[*] Fetching IP data from AbuseIPDB API v2: {}", targetIp);

        try {
            AbuseIPDBResponseDTO response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/check")
                            .queryParam("ipAddress", targetIp)
                            .queryParam("maxAgeInDays", 90)
                            .queryParam("verbose", "")
                            .build())
                    .header("Key", apiKey)
                    .header("Accept", "application/json")
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), clientResponse -> {
                        HttpStatus code = (HttpStatus) clientResponse.statusCode();
                        if (code == HttpStatus.UNAUTHORIZED) {
                            return Mono.error(new ThreatIntelligenceException("ERROR: AbuseIPDB API key is invalid."));
                        } else if (code == HttpStatus.FORBIDDEN) {
                            return Mono.error(new ThreatIntelligenceException("ERROR: Access to AbuseIPDB is forbidden."));
                        } else if (code == HttpStatus.TOO_MANY_REQUESTS) {
                            return Mono.error(new ThreatIntelligenceException("ERROR: AbuseIPDB API rate limit exceeded. Please try again later."));
                        } else {
                            return Mono.error(new ThreatIntelligenceException("ERROR: AbuseIPDB returned HTTP " + code.value()));
                        }
                    })
                    .bodyToMono(AbuseIPDBResponseDTO.class)
                    .block();

            if (response == null || response.getData() == null) {
                throw new ThreatIntelligenceException("ERROR: No data received from AbuseIPDB for IP: " + targetIp);
            }

            AbuseIPDBDataDTO data = response.getData();
            log.info("[+] Successfully retrieved reputation report for IP: {}", targetIp);

            int score = data.getAbuseConfidenceScore() != null ? data.getAbuseConfidenceScore() : 0;
            ThreatLevel threatLevel = ThreatLevel.fromScore(score);

            return ThreatIntelligenceReport.builder()
                    .ipAddress(orNA(data.getIpAddress()))
                    .isPublic(boolToYesNo(data.getIsPublic()))
                    .ipVersion(data.getIpVersion() != null ? "IPv" + data.getIpVersion() : "N/A")
                    .isWhitelisted(boolToYesNo(data.getIsWhitelisted()))
                    .abuseConfidenceScore(score + "%")
                    .countryCode(orNA(data.getCountryCode()))
                    .usageType(orNA(data.getUsageType()))
                    .isp(orNA(data.getIsp()))
                    .domain(orNA(data.getDomain()))
                    .totalReports(data.getTotalReports() != null ? String.valueOf(data.getTotalReports()) : "0")
                    .numDistinctUsers(data.getNumDistinctUsers() != null ? String.valueOf(data.getNumDistinctUsers()) : "0")
                    .lastReportedAt(orNA(data.getLastReportedAt()))
                    .threatLevel(threatLevel)
                    .build();

        } catch (WebClientResponseException e) {
            log.error("[-] WebClient API response failure: {}", e.getMessage());
            throw new ThreatIntelligenceException("ERROR: AbuseIPDB returned HTTP " + e.getStatusCode().value(), e);
        } catch (Exception e) {
            if (e instanceof ThreatIntelligenceException) {
                throw (ThreatIntelligenceException) e;
            }
            log.error("[-] Unexpected threat intelligence lookup failure: {}", e.getMessage());
            throw new ThreatIntelligenceException("ERROR: Unexpected failure during threat lookup. Please try again.", e);
        }
    }

    private boolean isValidIp(String ip) {
        if (ip == null || ip.isBlank()) return false;
        try {
            InetAddress address = InetAddress.getByName(ip);
            return address.getHostAddress().equals(ip);
        } catch (UnknownHostException e) {
            return false;
        }
    }

    private String orNA(String value) {
        return (value != null && !value.isBlank()) ? value : "N/A";
    }

    private String boolToYesNo(Boolean value) {
        if (value == null) return "N/A";
        return value ? "Yes" : "No";
    }

    private ThreatIntelligenceReport generateMockReport(String ipAddress) {
        boolean isPrivate = ipAddress.startsWith("192.168.") || ipAddress.startsWith("10.") || ipAddress.startsWith("172.16.");
        int mockScore = isPrivate ? 0 : Math.abs(ipAddress.hashCode()) % 100;
        boolean isV4 = !ipAddress.contains(":");
        
        return ThreatIntelligenceReport.builder()
                .ipAddress(ipAddress)
                .isPublic(isPrivate ? "No" : "Yes")
                .ipVersion(isV4 ? "IPv4" : "IPv6")
                .isWhitelisted(isPrivate ? "Yes" : "No")
                .abuseConfidenceScore(mockScore + "%")
                .countryCode(isPrivate ? "LCL" : "US")
                .usageType(isPrivate ? "Private Subnet" : "Local LAN / Reserved")
                .isp(isPrivate ? "Local Network Authority" : "Google LLC")
                .domain(isPrivate ? "local.lan" : "google.com")
                .totalReports(String.valueOf(isPrivate ? 0 : mockScore * 3))
                .numDistinctUsers(String.valueOf(isPrivate ? 0 : mockScore / 2))
                .lastReportedAt(isPrivate ? "Never" : "2026-08-02T12:00:00+00:00")
                .threatLevel(ThreatLevel.fromScore(mockScore))
                .build();
    }
}
