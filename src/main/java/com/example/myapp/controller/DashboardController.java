package com.example.myapp.controller;

import com.example.myapp.repository.AlertRepository;
import com.example.myapp.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class DashboardController {
    private final AlertRepository alertRepository;
    private final AssetRepository assetRepository;

    @GetMapping("/api/dashboard")
    public Map<String, Object> dashboard() {
        Map<String, Object> response = new LinkedHashMap<>();
        long totalAssets = assetRepository.count();
        long critical = alertRepository.countBySeverity("CRITICAL");
        long high = alertRepository.countBySeverity("HIGH");
        response.put("totalAssets", totalAssets);
        response.put("onlineAssets", assetRepository.countOnlineAssets());
        response.put("offlineAssets", assetRepository.countOfflineAssets());
        response.put("criticalAlerts", critical);
        response.put("highAlerts", high);
        response.put("activeThreats", critical + high);
        response.put("alerts", alertRepository.findAllByOrderByCreatedAtDesc().stream().limit(10).toList());
        return response;
    }
}
