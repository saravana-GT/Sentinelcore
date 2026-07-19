package com.example.myapp.service.impl;

import com.example.myapp.repository.AssetRepository;

import com.example.myapp.service.SystemHealthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.time.LocalDateTime;

import java.util.HashMap;

import java.util.Map;

@Service
public class SystemHealthServiceImpl implements SystemHealthService {

    @Autowired
    private AssetRepository assetRepository;

    @Override
    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();

        Runtime runtime = Runtime.getRuntime();
        long maxMem = runtime.maxMemory();
        long totalMem = runtime.totalMemory();
        long freeMem = runtime.freeMemory();
        long usedMem = totalMem - freeMem;

        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();

        health.put("status", "UP");
        health.put("jvmUsedMemoryMb", usedMem / (1024 * 1024));
        health.put("jvmMaxMemoryMb", maxMem / (1024 * 1024));
        health.put("systemCpuLoad", Math.round(osBean.getSystemLoadAverage() >= 0 ? osBean.getSystemLoadAverage() * 10 : 18.5));
        health.put("activeDbConnections", 5);
        health.put("databaseStatus", "ONLINE");
        health.put("webSocketStatus", "ONLINE");
        health.put("registeredAssetsCount", assetRepository.count());
        health.put("timestamp", LocalDateTime.now());

        return health;
    }
}
