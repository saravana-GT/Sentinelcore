package com.example.myapp.service.impl;

import com.example.myapp.model.Asset;
import com.example.myapp.model.AuditLog;

import com.example.myapp.repository.AssetProcessRepository;
import com.example.myapp.repository.AssetRepository;
import com.example.myapp.repository.AuditLogRepository;

import com.example.myapp.service.IncidentResponseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class IncidentResponseServiceImpl implements IncidentResponseService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AssetProcessRepository assetProcessRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public Map<String, Object> killProcess(String hostname, Integer pid, String username) {
        Map<String, Object> response = new HashMap<>();
        Optional<Asset> assetOpt = assetRepository.findByHostname(hostname);
        if (assetOpt.isPresent()) {
            Asset asset = assetOpt.get();
            assetProcessRepository.deleteByAsset(asset);
        }

        AuditLog audit = new AuditLog(
                username != null ? username : "SOC_ANALYST",
                "KILL_PROCESS",
                hostname,
                "Terminated malicious process PID: " + pid + " on endpoint host: " + hostname
        );
        auditLogRepository.save(audit);

        response.put("status", "SUCCESS");
        response.put("action", "KILL_PROCESS");
        response.put("targetHost", hostname);
        response.put("pid", pid);
        response.put("timestamp", LocalDateTime.now());
        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> isolateDevice(String hostname, String username) {
        Map<String, Object> response = new HashMap<>();
        Optional<Asset> assetOpt = assetRepository.findByHostname(hostname);
        if (assetOpt.isPresent()) {
            Asset asset = assetOpt.get();
            asset.setStatus("ISOLATED");
            asset.setAgentStatus("OFFLINE");
            assetRepository.save(asset);
        }

        AuditLog audit = new AuditLog(
                username != null ? username : "SOC_ANALYST",
                "ISOLATE_DEVICE",
                hostname,
                "Enforced network isolation on endpoint host: " + hostname
        );
        auditLogRepository.save(audit);

        response.put("status", "SUCCESS");
        response.put("action", "ISOLATE_DEVICE");
        response.put("targetHost", hostname);
        response.put("deviceState", "ISOLATED");
        response.put("timestamp", LocalDateTime.now());
        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> restartAgent(String hostname, String username) {
        Map<String, Object> response = new HashMap<>();
        Optional<Asset> assetOpt = assetRepository.findByHostname(hostname);
        if (assetOpt.isPresent()) {
            Asset asset = assetOpt.get();
            asset.setAgentStatus("ONLINE");
            asset.setLastSeen(LocalDateTime.now());
            assetRepository.save(asset);
        }

        AuditLog audit = new AuditLog(
                username != null ? username : "SOC_ANALYST",
                "RESTART_AGENT",
                hostname,
                "Re-initialized endpoint telemetry agent service on host: " + hostname
        );
        auditLogRepository.save(audit);

        response.put("status", "SUCCESS");
        response.put("action", "RESTART_AGENT");
        response.put("targetHost", hostname);
        response.put("agentState", "ONLINE");
        response.put("timestamp", LocalDateTime.now());
        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> collectLogs(String hostname, String username) {
        Map<String, Object> response = new HashMap<>();
        AuditLog audit = new AuditLog(
                username != null ? username : "SOC_ANALYST",
                "COLLECT_LOGS",
                hostname,
                "Generated forensic log collection bundle for host: " + hostname
        );
        auditLogRepository.save(audit);

        response.put("status", "SUCCESS");
        response.put("action", "COLLECT_LOGS");
        response.put("targetHost", hostname);
        response.put("bundleUrl", "/api/incidents/logs/bundle-" + hostname + ".zip");
        response.put("timestamp", LocalDateTime.now());
        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> runScan(String hostname, String username) {
        Map<String, Object> response = new HashMap<>();
        AuditLog audit = new AuditLog(
                username != null ? username : "SOC_ANALYST",
                "RUN_SCAN",
                hostname,
                "Initiated on-demand vulnerability & FIM integrity scan on host: " + hostname
        );
        auditLogRepository.save(audit);

        response.put("status", "SUCCESS");
        response.put("action", "RUN_SCAN");
        response.put("targetHost", hostname);
        response.put("scanId", "SCAN-" + System.currentTimeMillis());
        response.put("timestamp", LocalDateTime.now());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditTrail() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
