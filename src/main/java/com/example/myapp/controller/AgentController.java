package com.example.myapp.controller;

import com.example.myapp.dto.request.*;
import com.example.myapp.dto.response.AssetResponse;
import com.example.myapp.service.AgentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;

    @PostMapping("/register")
    public ResponseEntity<AssetResponse> registerAgent(@Valid @RequestBody AgentRegisterRequest request) {
        AssetResponse response = agentService.registerAgent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<String> heartbeat(@Valid @RequestBody AgentHeartbeatRequest request) {
        agentService.processHeartbeat(request);
        return ResponseEntity.ok("Heartbeat processed");
    }

    @PostMapping("/system")
    public ResponseEntity<String> systemMetrics(@Valid @RequestBody AgentSystemMetricsRequest request) {
        agentService.processSystemMetrics(request);
        return ResponseEntity.ok("Metrics processed");
    }

    @PostMapping("/processes")
    public ResponseEntity<String> processes(@Valid @RequestBody AgentProcessesRequest request) {
        agentService.processProcesses(request);
        return ResponseEntity.ok("Processes processed");
    }

    @PostMapping("/software")
    public ResponseEntity<String> software(@Valid @RequestBody AgentSoftwareRequest request) {
        agentService.processSoftware(request);
        return ResponseEntity.ok("Software list processed");
    }

    @PostMapping("/network")
    public ResponseEntity<String> network(@Valid @RequestBody AgentNetworkRequest request) {
        agentService.processNetwork(request);
        return ResponseEntity.ok("Network list processed");
    }
}
