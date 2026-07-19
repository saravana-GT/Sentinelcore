package com.example.myapp.controller;

import com.example.myapp.model.AuditLog;
import com.example.myapp.service.IncidentResponseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
public class IncidentResponseController {

    @Autowired
    private IncidentResponseService incidentResponseService;

    @PostMapping("/remediation/kill-process")
    public ResponseEntity<Map<String, Object>> killProcess(@RequestBody Map<String, Object> req) {
        String host = (String) req.getOrDefault("hostname", "UNKNOWN-HOST");
        Integer pid = req.get("pid") != null ? Integer.parseInt(req.get("pid").toString()) : 1024;
        String user = (String) req.getOrDefault("username", "SOC_ANALYST");
        return ResponseEntity.ok(incidentResponseService.killProcess(host, pid, user));
    }

    @PostMapping("/remediation/isolate-device")
    public ResponseEntity<Map<String, Object>> isolateDevice(@RequestBody Map<String, Object> req) {
        String host = (String) req.getOrDefault("hostname", "UNKNOWN-HOST");
        String user = (String) req.getOrDefault("username", "SOC_ANALYST");
        return ResponseEntity.ok(incidentResponseService.isolateDevice(host, user));
    }

    @PostMapping("/remediation/restart-agent")
    public ResponseEntity<Map<String, Object>> restartAgent(@RequestBody Map<String, Object> req) {
        String host = (String) req.getOrDefault("hostname", "UNKNOWN-HOST");
        String user = (String) req.getOrDefault("username", "SOC_ANALYST");
        return ResponseEntity.ok(incidentResponseService.restartAgent(host, user));
    }

    @PostMapping("/remediation/collect-logs")
    public ResponseEntity<Map<String, Object>> collectLogs(@RequestBody Map<String, Object> req) {
        String host = (String) req.getOrDefault("hostname", "UNKNOWN-HOST");
        String user = (String) req.getOrDefault("username", "SOC_ANALYST");
        return ResponseEntity.ok(incidentResponseService.collectLogs(host, user));
    }

    @PostMapping("/remediation/run-scan")
    public ResponseEntity<Map<String, Object>> runScan(@RequestBody Map<String, Object> req) {
        String host = (String) req.getOrDefault("hostname", "UNKNOWN-HOST");
        String user = (String) req.getOrDefault("username", "SOC_ANALYST");
        return ResponseEntity.ok(incidentResponseService.runScan(host, user));
    }

    @GetMapping("/audit-trail")
    public ResponseEntity<List<AuditLog>> getAuditTrail() {
        return ResponseEntity.ok(incidentResponseService.getAuditTrail());
    }
}
