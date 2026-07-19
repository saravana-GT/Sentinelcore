package com.example.myapp.service.impl;

import com.example.myapp.service.ThreatIntelService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ThreatIntelServiceImpl implements ThreatIntelService {

    @Override
    public Map<String, Object> enrichAlertIoC(String indicatorType, String indicatorValue) {
        Map<String, Object> enrichment = new HashMap<>();
        enrichment.put("indicatorType", indicatorType != null ? indicatorType : "IP");
        enrichment.put("indicatorValue", indicatorValue != null ? indicatorValue : "192.168.1.100");
        enrichment.put("enrichedAt", LocalDateTime.now());

        if ("IP".equalsIgnoreCase(indicatorType)) {
            Map<String, Object> abuseIp = new HashMap<>();
            abuseIp.put("abuseConfidenceScore", 94);
            abuseIp.put("countryCode", "US");
            abuseIp.put("isp", "DigitalOcean Cloud Infrastructure");
            abuseIp.put("totalReports", 142);
            abuseIp.put("isTorExitNode", true);
            enrichment.put("abuseIPDB", abuseIp);

            Map<String, Object> vt = new HashMap<>();
            vt.put("positives", 42);
            vt.put("total", 70);
            vt.put("reputation", "MALICIOUS");
            enrichment.put("virusTotal", vt);
        } else if ("HASH".equalsIgnoreCase(indicatorType) || "FILE".equalsIgnoreCase(indicatorType)) {
            Map<String, Object> vt = new HashMap<>();
            vt.put("positives", 58);
            vt.put("total", 72);
            vt.put("malwareFamily", "CobaltStrike.Beacon.v4");
            vt.put("reputation", "MALICIOUS");
            enrichment.put("virusTotal", vt);

            Map<String, Object> tf = new HashMap<>();
            tf.put("threatType", "botnet_cc");
            tf.put("confidenceLevel", 100);
            tf.put("reporter", "ThreatFox Intelligence Stream");
            enrichment.put("threatFox", tf);
        }

        // MITRE ATT&CK Mapping
        Map<String, Object> mitre = new HashMap<>();
        mitre.put("tactic", "Execution / Persistence");
        mitre.put("techniqueId", "T1059.001");
        mitre.put("techniqueName", "Command and Scripting Interpreter: PowerShell");
        mitre.put("url", "https://attack.mitre.org/techniques/T1059/001/");
        enrichment.put("mitreAttack", mitre);

        return enrichment;
    }

    @Override
    public List<Map<String, Object>> getMitreAttackMatrix() {
        return List.of(
            Map.of("id", "T1059.001", "name", "PowerShell Abuse", "tactic", "Execution", "severity", "HIGH", "desc", "Adversaries may abuse PowerShell commands for execution."),
            Map.of("id", "T1055", "name", "Process Injection", "tactic", "Defense Evasion", "severity", "CRITICAL", "desc", "Injecting code into processes to evade defenses."),
            Map.of("id", "T1547.001", "name", "Registry Run Keys / Startup Folder", "tactic", "Persistence", "severity", "HIGH", "desc", "Modifying registry run keys for persistence."),
            Map.of("id", "T1078", "name", "Valid Accounts", "tactic", "Initial Access", "severity", "MEDIUM", "desc", "Obtaining credentials of existing accounts."),
            Map.of("id", "T1190", "name", "Exploit Public-Facing Application", "tactic", "Initial Access", "severity", "CRITICAL", "desc", "Exploiting web application vulnerabilities.")
        );
    }

    @Override
    public List<Map<String, Object>> getIocWatchlist() {
        return List.of(
            Map.of("indicator", "185.220.101.5", "type", "IP", "source", "AbuseIPDB", "score", 98, "status", "ACTIVE_BLOCK"),
            Map.of("indicator", "45.147.229.12", "type", "IP", "source", "ThreatFox", "score", 92, "status", "ACTIVE_BLOCK"),
            Map.of("indicator", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "type", "SHA256", "source", "VirusTotal", "score", 100, "status", "MALICIOUS"),
            Map.of("indicator", "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4", "type", "SHA256", "source", "ThreatFox", "score", 95, "status", "MALICIOUS")
        );
    }
}
