package com.example.myapp.service.impl;

import com.example.myapp.dto.request.*;
import com.example.myapp.dto.response.AssetResponse;
import com.example.myapp.enums.AssetType;
import com.example.myapp.exception.ResourceNotFoundException;
import com.example.myapp.mapper.AssetMapper;
import com.example.myapp.model.*;
import com.example.myapp.repository.*;
import com.example.myapp.service.AgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentServiceImpl implements AgentService {

    private final AssetRepository assetRepository;
    private final AssetProcessRepository assetProcessRepository;
    private final AssetSoftwareRepository assetSoftwareRepository;
    private final AssetNetworkInterfaceRepository assetNetworkInterfaceRepository;
    private final AssetMetricRepository assetMetricRepository;

    @Override
    @Transactional
    public AssetResponse registerAgent(AgentRegisterRequest request) {
        Asset asset = assetRepository.findByHostname(request.getHostname())
                .orElseGet(() -> Asset.builder()
                        .hostname(request.getHostname())
                        .status("ACTIVE")
                        .criticality("MEDIUM")
                        .build());

        if (request.getDeviceName() != null) asset.setDeviceName(request.getDeviceName());
        if (request.getAssetType() != null) asset.setAssetType(request.getAssetType());
        else if (asset.getAssetType() == null) asset.setAssetType(AssetType.DESKTOP);

        if (request.getOperatingSystem() != null) asset.setOperatingSystem(request.getOperatingSystem());
        if (request.getVersion() != null) asset.setVersion(request.getVersion());
        if (request.getMacAddress() != null) asset.setMacAddress(request.getMacAddress());
        if (request.getIpAddress() != null) asset.setIpAddress(request.getIpAddress());
        if (request.getPublicIp() != null) asset.setPublicIp(request.getPublicIp());

        if (request.getCpu() != null) asset.setCpu(request.getCpu());
        if (request.getRam() != null) asset.setRam(request.getRam());
        if (request.getDisk() != null) asset.setDisk(request.getDisk());
        if (request.getArchitecture() != null) asset.setArchitecture(request.getArchitecture());

        if (request.getOwner() != null) asset.setOwner(request.getOwner());
        if (request.getDepartment() != null) asset.setDepartment(request.getDepartment());
        if (request.getLocation() != null) asset.setLocation(request.getLocation());

        asset.setAgentStatus("ONLINE");
        asset.setLastSeen(LocalDateTime.now());

        Asset saved = assetRepository.save(asset);
        return AssetMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void processHeartbeat(AgentHeartbeatRequest request) {
        Asset asset = assetRepository.findByHostname(request.getHostname())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found for hostname: " + request.getHostname()));

        asset.setAgentStatus("ONLINE");
        asset.setLastSeen(LocalDateTime.now());
        if (request.getIpAddress() != null && !request.getIpAddress().isEmpty()) {
            asset.setIpAddress(request.getIpAddress());
        }
        assetRepository.save(asset);
    }

    @Override
    @Transactional
    public void processSystemMetrics(AgentSystemMetricsRequest request) {
        Asset asset = assetRepository.findByHostname(request.getHostname())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found for hostname: " + request.getHostname()));

        asset.setAgentStatus("ONLINE");
        asset.setLastSeen(LocalDateTime.now());
        if (request.getLoggedUser() != null && !request.getLoggedUser().isEmpty()) {
            asset.setOwner(request.getLoggedUser());
        }

        if (request.getCpuUsage() != null) asset.setCpu(String.format("%.1f%%", request.getCpuUsage()));
        if (request.getRamUsage() != null) asset.setRam(String.format("%.1f%%", request.getRamUsage()));
        if (request.getDiskUsage() != null) asset.setDisk(String.format("%.1f%%", request.getDiskUsage()));

        assetRepository.save(asset);

        // Record telemetry history
        AssetMetric metric = AssetMetric.builder()
                .asset(asset)
                .cpuUsage(request.getCpuUsage() != null ? request.getCpuUsage() : 0.0)
                .ramUsage(request.getRamUsage() != null ? request.getRamUsage() : 0.0)
                .diskUsage(request.getDiskUsage() != null ? request.getDiskUsage() : 0.0)
                .timestamp(LocalDateTime.now())
                .build();
        assetMetricRepository.save(metric);
    }

    @Override
    @Transactional
    public void processProcesses(AgentProcessesRequest request) {
        Asset asset = assetRepository.findByHostname(request.getHostname())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found for hostname: " + request.getHostname()));

        assetProcessRepository.deleteByAsset(asset);

        if (request.getProcesses() != null && !request.getProcesses().isEmpty()) {
            List<AssetProcess> list = new ArrayList<>();
            for (AgentProcessesRequest.ProcessItem item : request.getProcesses()) {
                AssetProcess p = AssetProcess.builder()
                        .asset(asset)
                        .name(item.getName() != null ? item.getName() : "unknown")
                        .pid(item.getPid() != null ? item.getPid() : 0)
                        .cpuUsage(item.getCpuUsage())
                        .memoryUsage(item.getMemoryUsage())
                        .build();
                list.add(p);
            }
            assetProcessRepository.saveAll(list);
        }
    }

    @Override
    @Transactional
    public void processSoftware(AgentSoftwareRequest request) {
        Asset asset = assetRepository.findByHostname(request.getHostname())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found for hostname: " + request.getHostname()));

        assetSoftwareRepository.deleteByAsset(asset);

        if (request.getSoftwareList() != null && !request.getSoftwareList().isEmpty()) {
            List<AssetSoftware> list = new ArrayList<>();
            for (AgentSoftwareRequest.SoftwareItem item : request.getSoftwareList()) {
                AssetSoftware s = AssetSoftware.builder()
                        .asset(asset)
                        .name(item.getName() != null ? item.getName() : "Software")
                        .version(item.getVersion())
                        .publisher(item.getPublisher())
                        .installDate(item.getInstallDate())
                        .build();
                list.add(s);
            }
            assetSoftwareRepository.saveAll(list);
        }
    }

    @Override
    @Transactional
    public void processNetwork(AgentNetworkRequest request) {
        Asset asset = assetRepository.findByHostname(request.getHostname())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found for hostname: " + request.getHostname()));

        assetNetworkInterfaceRepository.deleteByAsset(asset);

        if (request.getNetworkInterfaces() != null && !request.getNetworkInterfaces().isEmpty()) {
            List<AssetNetworkInterface> list = new ArrayList<>();
            for (AgentNetworkRequest.NetworkItem item : request.getNetworkInterfaces()) {
                AssetNetworkInterface n = AssetNetworkInterface.builder()
                        .asset(asset)
                        .interfaceName(item.getInterfaceName() != null ? item.getInterfaceName() : "eth0")
                        .ipAddress(item.getIpAddress())
                        .macAddress(item.getMacAddress())
                        .status(item.getStatus() != null ? item.getStatus() : "UP")
                        .build();
                list.add(n);
            }
            assetNetworkInterfaceRepository.saveAll(list);
        }
    }
}
