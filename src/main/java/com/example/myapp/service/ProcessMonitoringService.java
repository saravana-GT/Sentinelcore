package com.example.myapp.service;

import com.example.myapp.dto.request.AgentProcessesRequest;
import com.example.myapp.model.Alert;
import java.util.List;

public interface ProcessMonitoringService {

    List<Alert> analyzeProcesses(AgentProcessesRequest request);

    List<Alert> getProcessThreatAlerts();
}
