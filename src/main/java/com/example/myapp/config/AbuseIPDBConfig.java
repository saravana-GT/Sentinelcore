package com.example.myapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class AbuseIPDBConfig {

    private static final Logger log = LoggerFactory.getLogger(AbuseIPDBConfig.class);

    private final String apiKey;

    public AbuseIPDBConfig(@Value("${abuseipdb.api.key:}") String apiKeyProperty) {
        String envKey = System.getenv("ABUSEIPDB_API_KEY");
        if (envKey != null && !envKey.trim().isEmpty()) {
            this.apiKey = envKey.trim();
        } else {
            this.apiKey = apiKeyProperty != null ? apiKeyProperty.trim() : "";
        }
    }

    @PostConstruct
    public void validate() {
        log.info("[*] Initializing AbuseIPDB Threat Intelligence Configuration...");
        if (apiKey.isEmpty()) {
            log.warn("[!] ABUSEIPDB_API_KEY is not configured! Reputation check API requests will fail.");
        } else {
            log.info("[+] AbuseIPDB API key validated and loaded successfully.");
        }
    }

    public String getApiKey() {
        return apiKey;
    }
}
