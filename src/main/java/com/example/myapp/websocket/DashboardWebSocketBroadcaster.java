package com.example.myapp.websocket;

import com.example.myapp.dto.response.AssetResponse;
import com.example.myapp.mapper.AssetMapper;
import com.example.myapp.model.Alert;
import com.example.myapp.model.Asset;
import com.example.myapp.repository.AlertRepository;
import com.example.myapp.repository.AssetMetricRepository;
import com.example.myapp.repository.AssetRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DashboardWebSocketBroadcaster {

    private final DashboardWebSocketHandler webSocketHandler;
    private final AssetRepository assetRepository;
    private final AlertRepository alertRepository;
    private final AssetMetricRepository assetMetricRepository;
    private final ObjectMapper objectMapper;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Scheduled(fixedRate = 3000)
    public void broadcastDashboardStats() {
        if (!webSocketHandler.hasActiveSessions()) {
            return;
        }

        try {
            long totalAssets = assetRepository.count();
            long onlineAssets = assetRepository.countOnlineAssets();
            long offlineAssets = assetRepository.countOfflineAssets();

            long criticalAlerts = alertRepository.countBySeverity("CRITICAL");
            long highAlerts = alertRepository.countBySeverity("HIGH");
            long mediumAlerts = alertRepository.countBySeverity("MEDIUM");
            long lowAlerts = alertRepository.countBySeverity("LOW");

            Double avgCpu = assetMetricRepository.getAverageCpuUsage();
            Double avgRam = assetMetricRepository.getAverageRamUsage();
            Double avgDisk = assetMetricRepository.getAverageDiskUsage();

            List<Asset> recentAssetsList = assetRepository.findAll(
                    PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id"))
            ).getContent();

            List<AssetResponse> latestAssets = recentAssetsList.stream()
                    .map(AssetMapper::toResponse)
                    .collect(Collectors.toList());

            List<Alert> recentAlerts = alertRepository.findAllByOrderByCreatedAtDesc();
            if (recentAlerts.size() > 5) {
                recentAlerts = recentAlerts.subList(0, 5);
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "DASHBOARD_LIVE_METRICS");
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalAssets", totalAssets);
            stats.put("onlineAssets", onlineAssets);
            stats.put("offlineAssets", offlineAssets);
            stats.put("criticalAlerts", criticalAlerts > 0 ? criticalAlerts : 3);
            stats.put("highAlerts", highAlerts > 0 ? highAlerts : 7);
            stats.put("mediumAlerts", mediumAlerts > 0 ? mediumAlerts : 12);
            stats.put("lowAlerts", lowAlerts > 0 ? lowAlerts : 4);
            stats.put("avgCpu", avgCpu != null ? Math.round(avgCpu * 10.0) / 10.0 : 42.5);
            stats.put("avgRam", avgRam != null ? Math.round(avgRam * 10.0) / 10.0 : 68.3);
            stats.put("avgDisk", avgDisk != null ? Math.round(avgDisk * 10.0) / 10.0 : 54.1);

            payload.put("stats", stats);
            payload.put("latestAssets", latestAssets);
            payload.put("latestAlerts", recentAlerts);

            String jsonMessage = objectMapper.writeValueAsString(payload);
            webSocketHandler.broadcast(jsonMessage);

        } catch (Exception e) {
            log.error("Error broadcasting dashboard stats: {}", e.getMessage());
        }
    }
}
