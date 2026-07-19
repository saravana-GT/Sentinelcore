package com.example.myapp.service;

import com.example.myapp.dto.request.*;
import com.example.myapp.dto.response.AssetResponse;

public interface AgentService {
    AssetResponse registerAgent(AgentRegisterRequest request);
    void processHeartbeat(AgentHeartbeatRequest request);
    void processSystemMetrics(AgentSystemMetricsRequest request);
    void processProcesses(AgentProcessesRequest request);
    void processSoftware(AgentSoftwareRequest request);
    void processNetwork(AgentNetworkRequest request);
}
