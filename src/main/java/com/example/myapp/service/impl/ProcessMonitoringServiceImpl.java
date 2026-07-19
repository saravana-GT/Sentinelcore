package com.example.myapp.service.impl;

import com.example.myapp.dto.request.AgentProcessesRequest;
import com.example.myapp.model.Alert;
import com.example.myapp.repository.AlertRepository;
import com.example.myapp.service.ProcessMonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProcessMonitoringServiceImpl implements ProcessMonitoringService {

    @Autowired
    private AlertRepository alertRepository;

    @Override
    @Transactional
    public List<Alert> analyzeProcesses(AgentProcessesRequest request) {
        List<Alert> generatedAlerts = new ArrayList<>();
        if (request == null || request.getProcesses() == null) {
            return generatedAlerts;
        }

        String hostname = request.getHostname() != null ? request.getHostname() : "UNKNOWN-HOST";

        for (AgentProcessesRequest.ProcessItem proc : request.getProcesses()) {
            String name = proc.getName() != null ? proc.getName().toLowerCase() : "";

            // Rule 1: PowerShell Abuse
            if (name.contains("powershell") || name.contains("pwsh")) {
                Alert alert = new Alert();
                alert.setTitle("PowerShell Abuse Detected on " + hostname);
                alert.setDescription("Suspicious PowerShell process execution detected (PID: " + proc.getPid() + ", CPU: " + proc.getCpuUsage() + "%).");
                alert.setSeverity("CRITICAL");
                alert.setSource(hostname + " / Endpoint Agent");
                alert.setStatus("Open");
                generatedAlerts.add(alertRepository.save(alert));
            }

            // Rule 2: Command Prompt Abuse & Shadow Copy Deletion
            if (name.contains("cmd.exe") || name.contains("vssadmin") || name.contains("certutil")) {
                Alert alert = new Alert();
                alert.setTitle("Command Line / Living-off-the-Land Abuse on " + hostname);
                alert.setDescription("Command line tool execution detected (Process: " + proc.getName() + ", PID: " + proc.getPid() + ").");
                alert.setSeverity("HIGH");
                alert.setSource(hostname + " / Process Monitor");
                alert.setStatus("Open");
                generatedAlerts.add(alertRepository.save(alert));
            }

            // Rule 3: Persistence Mechanism (Scheduled Tasks & Startup)
            if (name.contains("schtasks") || name.contains("reg.exe") || name.contains("cron")) {
                Alert alert = new Alert();
                alert.setTitle("Persistence Mechanism Mod Detected on " + hostname);
                alert.setDescription("Persistence registration attempt detected via process: " + proc.getName());
                alert.setSeverity("HIGH");
                alert.setSource(hostname + " / Persistence Monitor");
                alert.setStatus("Open");
                generatedAlerts.add(alertRepository.save(alert));
            }

            // Rule 4: Unknown High CPU Process
            if (proc.getCpuUsage() != null && proc.getCpuUsage() > 75.0) {
                Alert alert = new Alert();
                alert.setTitle("High CPU Anomaly / Cryptominer Suspect on " + hostname);
                alert.setDescription("Process " + proc.getName() + " (PID: " + proc.getPid() + ") consuming " + proc.getCpuUsage() + "% CPU.");
                alert.setSeverity("MEDIUM");
                alert.setSource(hostname + " / Anomaly Detector");
                alert.setStatus("Open");
                generatedAlerts.add(alertRepository.save(alert));
            }
        }

        return generatedAlerts;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Alert> getProcessThreatAlerts() {
        return alertRepository.findAll().stream()
                .filter(a -> a.getSource() != null && a.getSource().contains("Process"))
                .toList();
    }
}
