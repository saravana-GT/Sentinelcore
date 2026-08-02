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

import java.util.regex.Pattern;

@Service
public class ThreatIntelLookupServiceImpl implements ThreatIntelLookupService {

    private static final Logger log = LoggerFactory.getLogger(ThreatIntelLookupServiceImpl.class);

    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
    );

    private static final Pattern IPV6_PATTERN = Pattern.compile(
            "^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$"
    );

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

        boolean isV4 = IPV4_PATTERN.matcher(targetIp).matches();
        boolean isV6 = IPV6_PATTERN.matcher(targetIp).matches();

        if (!isV4 && !isV6) {
            log.warn("[-] IP Address validation failed for input: {}", targetIp);
            throw new ThreatIntelligenceException("Invalid IP Address");
        }

        String apiKey = apiConfig.getApiKey();

        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("[!] AbuseIPDB API key not configured. Returning mock threat report.");
            return generateMockReport(targetIp, isV4);
        }

        log.info("[*] Fetching IP data from AbuseIPDB API v2: {}", targetIp);

        try {
            AbuseIPDBResponseDTO response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/check")
                            .queryParam("ipAddress", targetIp)
                            .build())
                    .header("Key", apiKey)
                    .header("Accept", "application/json")
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), clientResponse -> {
                        HttpStatus code = (HttpStatus) clientResponse.statusCode();
                        if (code == HttpStatus.UNAUTHORIZED) {
                            return Mono.error(new ThreatIntelligenceException("Invalid API Key (401 Unauthorized)"));
                        } else if (code == HttpStatus.FORBIDDEN) {
                            return Mono.error(new ThreatIntelligenceException("Forbidden (403 Access Denied)"));
                        } else if (code == HttpStatus.TOO_MANY_REQUESTS) {
                            return Mono.error(new ThreatIntelligenceException("AbuseIPDB Rate Limit Exceeded (429)"));
                        } else {
                            return Mono.error(new ThreatIntelligenceException("AbuseIPDB API error: " + code.value()));
                        }
                    })
                    .bodyToMono(AbuseIPDBResponseDTO.class)
                    .block();

            if (response == null || response.getData() == null) {
                throw new ThreatIntelligenceException("Empty response: No Data returned from AbuseIPDB.");
            }

            AbuseIPDBDataDTO data = response.getData();
            log.info("[+] Successfully retrieved reputation report for IP: {}", targetIp);

            return ThreatIntelligenceReport.builder()
                    .ipAddress(data.getIpAddress())
                    .isPublic(data.isPublic() ? "Yes" : "No")
                    .ipVersion(data.getIpVersion() == 6 ? "IPv6" : "IPv4")
                    .isWhitelisted(data.isWhitelisted() ? "Yes" : "No")
                    .abuseConfidenceScore(data.getAbuseConfidenceScore() + "%")
                    .countryCode(data.getCountryCode() != null ? data.getCountryCode() : "N/A")
                    .usageType(data.getUsageType() != null ? data.getUsageType() : "N/A")
                    .ispName(data.getIsp() != null ? data.getIsp() : "Unknown")
                    .domainName(data.getDomain() != null ? data.getDomain() : "Unknown")
                    .totalReports(data.getTotalReports())
                    .distinctReporters(data.getNumDistinctUsers())
                    .lastReportedAt(data.getLastReportedAt() != null ? data.getLastReportedAt() : "Never")
                    .threatLevel(ThreatLevel.fromScore(data.getAbuseConfidenceScore()))
                    .build();

        } catch (WebClientResponseException e) {
            log.error("[-] WebClient API response failure: {}", e.getMessage());
            throw new ThreatIntelligenceException("Network connection failed to AbuseIPDB: " + e.getStatusText(), e);
        } catch (Exception e) {
            if (e instanceof ThreatIntelligenceException) {
                throw (ThreatIntelligenceException) e;
            }
            log.error("[-] Unexpected threat intelligence lookup failure: {}", e.getMessage());
            throw new ThreatIntelligenceException("Generic Error: Unexpected threat lookup exception: " + e.getMessage(), e);
        }
    }

    private ThreatIntelligenceReport generateMockReport(String ipAddress, boolean isV4) {
        boolean isPrivate = ipAddress.startsWith("192.168.") || ipAddress.startsWith("10.") || ipAddress.startsWith("172.16.");
        int mockScore = isPrivate ? 0 : Math.abs(ipAddress.hashCode()) % 100;
        
        return ThreatIntelligenceReport.builder()
                .ipAddress(ipAddress)
                .isPublic(isPrivate ? "No" : "Yes")
                .ipVersion(isV4 ? "IPv4" : "IPv6")
                .isWhitelisted(isPrivate ? "Yes" : "No")
                .abuseConfidenceScore(mockScore + "%")
                .countryCode(isPrivate ? "LCL" : "US")
                .usageType(isPrivate ? "Private Subnet" : "Local LAN / Reserved")
                .ispName(isPrivate ? "Local Network Authority" : "Google LLC")
                .domainName(isPrivate ? "local.lan" : "google.com")
                .totalReports(isPrivate ? 0 : mockScore * 3)
                .distinctReporters(isPrivate ? 0 : mockScore / 2)
                .lastReportedAt(isPrivate ? "Never" : "2026-08-02T12:00:00+00:00")
                .threatLevel(ThreatLevel.fromScore(mockScore))
                .build();
    }
}
