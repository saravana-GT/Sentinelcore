package com.example.myapp.service;

import com.example.myapp.model.ThreatIntelligenceReport;

public interface ThreatIntelLookupService {
    ThreatIntelligenceReport checkIpReputation(String ipAddress);
}
