package com.example.myapp.controller;

import com.example.myapp.dto.request.AgentProcessesRequest;
import com.example.myapp.model.Alert;
import com.example.myapp.service.ProcessMonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/process-monitoring")
public class ProcessMonitoringController {

    @Autowired
    private ProcessMonitoringService processMonitoringService;

    @PostMapping("/analyze")
    public ResponseEntity<List<Alert>> analyzeProcesses(@RequestBody AgentProcessesRequest request) {
        return ResponseEntity.ok(processMonitoringService.analyzeProcesses(request));
    }

    @GetMapping("/threats")
    public ResponseEntity<List<Alert>> getThreats() {
        return ResponseEntity.ok(processMonitoringService.getProcessThreatAlerts());
    }
}
