package com.example.myapp.controller;

import com.example.myapp.model.NetworkScanResult;
import com.example.myapp.service.NetworkDiscoveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/network-discovery")
public class NetworkDiscoveryController {

    @Autowired
    private NetworkDiscoveryService discoveryService;

    @PostMapping("/scan")
    public ResponseEntity<NetworkScanResult> runScan(@RequestBody Map<String, String> request) {
        String subnet = request.getOrDefault("targetSubnet", "192.168.1.0/24");
        String ports = request.getOrDefault("ports", "22,80,443,445,3389");
        return ResponseEntity.ok(discoveryService.runSubnetDiscoveryScan(subnet, ports));
    }

    @GetMapping("/history")
    public ResponseEntity<List<NetworkScanResult>> getScanHistory() {
        return ResponseEntity.ok(discoveryService.getScanHistory());
    }
}
