package com.example.myapp.mapper;

import com.example.myapp.dto.request.AssetRequest;
import com.example.myapp.dto.response.AssetResponse;
import com.example.myapp.model.*;

import java.util.Collections;
import java.util.stream.Collectors;

public class AssetMapper {

    public static AssetResponse toResponse(Asset asset) {
        if (asset == null) {
            return null;
        }

        AssetResponse.AssetResponseBuilder builder = AssetResponse.builder()
                .id(asset.getId())
                .hostname(asset.getHostname())
                .deviceName(asset.getDeviceName())
                .assetType(asset.getAssetType())
                .operatingSystem(asset.getOperatingSystem())
                .version(asset.getVersion())
                .macAddress(asset.getMacAddress())
                .ipAddress(asset.getIpAddress())
                .publicIp(asset.getPublicIp())
                .cpu(asset.getCpu())
                .ram(asset.getRam())
                .disk(asset.getDisk())
                .architecture(asset.getArchitecture())
                .owner(asset.getOwner())
                .department(asset.getDepartment())
                .location(asset.getLocation())
                .criticality(asset.getCriticality())
                .status(asset.getStatus())
                .agentStatus(asset.getAgentStatus())
                .lastSeen(asset.getLastSeen())
                .createdTime(asset.getCreatedTime())
                .updatedTime(asset.getUpdatedTime());

        if (asset.getProcesses() != null) {
            builder.processes(asset.getProcesses().stream()
                    .map(p -> AssetResponse.ProcessDto.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .pid(p.getPid())
                            .cpuUsage(p.getCpuUsage())
                            .memoryUsage(p.getMemoryUsage())
                            .build())
                    .collect(Collectors.toList()));
        } else {
            builder.processes(Collections.emptyList());
        }

        if (asset.getSoftwareList() != null) {
            builder.softwareList(asset.getSoftwareList().stream()
                    .map(s -> AssetResponse.SoftwareDto.builder()
                            .id(s.getId())
                            .name(s.getName())
                            .version(s.getVersion())
                            .publisher(s.getPublisher())
                            .installDate(s.getInstallDate())
                            .build())
                    .collect(Collectors.toList()));
        } else {
            builder.softwareList(Collections.emptyList());
        }

        if (asset.getNetworkInterfaces() != null) {
            builder.networkInterfaces(asset.getNetworkInterfaces().stream()
                    .map(n -> AssetResponse.NetworkInterfaceDto.builder()
                            .id(n.getId())
                            .interfaceName(n.getInterfaceName())
                            .ipAddress(n.getIpAddress())
                            .macAddress(n.getMacAddress())
                            .status(n.getStatus())
                            .build())
                    .collect(Collectors.toList()));
        } else {
            builder.networkInterfaces(Collections.emptyList());
        }

        if (asset.getMetricsHistory() != null) {
            builder.metricsHistory(asset.getMetricsHistory().stream()
                    .map(m -> AssetResponse.MetricDto.builder()
                            .id(m.getId())
                            .cpuUsage(m.getCpuUsage())
                            .ramUsage(m.getRamUsage())
                            .diskUsage(m.getDiskUsage())
                            .timestamp(m.getTimestamp())
                            .build())
                    .collect(Collectors.toList()));
        } else {
            builder.metricsHistory(Collections.emptyList());
        }

        return builder.build();
    }

    public static Asset toEntity(AssetRequest request) {
        if (request == null) {
            return null;
        }

        return Asset.builder()
                .hostname(request.getHostname())
                .deviceName(request.getDeviceName())
                .assetType(request.getAssetType())
                .operatingSystem(request.getOperatingSystem())
                .version(request.getVersion())
                .macAddress(request.getMacAddress())
                .ipAddress(request.getIpAddress())
                .publicIp(request.getPublicIp())
                .cpu(request.getCpu())
                .ram(request.getRam())
                .disk(request.getDisk())
                .architecture(request.getArchitecture())
                .owner(request.getOwner())
                .department(request.getDepartment())
                .location(request.getLocation())
                .criticality(request.getCriticality() != null ? request.getCriticality() : "MEDIUM")
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .agentStatus(request.getAgentStatus() != null ? request.getAgentStatus() : "UNINSTALLED")
                .build();
    }

    public static void updateEntity(Asset asset, AssetRequest request) {
        if (asset == null || request == null) {
            return;
        }
        asset.setHostname(request.getHostname());
        asset.setDeviceName(request.getDeviceName());
        asset.setAssetType(request.getAssetType());
        asset.setOperatingSystem(request.getOperatingSystem());
        asset.setVersion(request.getVersion());
        asset.setMacAddress(request.getMacAddress());
        asset.setIpAddress(request.getIpAddress());
        asset.setPublicIp(request.getPublicIp());
        asset.setCpu(request.getCpu());
        asset.setRam(request.getRam());
        asset.setDisk(request.getDisk());
        asset.setArchitecture(request.getArchitecture());
        asset.setOwner(request.getOwner());
        asset.setDepartment(request.getDepartment());
        asset.setLocation(request.getLocation());
        asset.setCriticality(request.getCriticality());
        asset.setStatus(request.getStatus());
        if (request.getAgentStatus() != null) {
            asset.setAgentStatus(request.getAgentStatus());
        }
    }
}
