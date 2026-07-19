package com.example.myapp.dto.response;

import com.example.myapp.enums.AssetType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetResponse {

    private Long id;
    private String hostname;
    private String deviceName;
    private AssetType assetType;
    private String operatingSystem;
    private String version;
    private String macAddress;
    private String ipAddress;
    private String publicIp;
    
    private String cpu;
    private String ram;
    private String disk;
    private String architecture;

    private String owner;
    private String department;
    private String location;

    private String criticality;
    private String status;
    private String agentStatus;

    private LocalDateTime lastSeen;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    private List<ProcessDto> processes;
    private List<SoftwareDto> softwareList;
    private List<NetworkInterfaceDto> networkInterfaces;
    private List<MetricDto> metricsHistory;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProcessDto {
        private Long id;
        private String name;
        private Integer pid;
        private Double cpuUsage;
        private Double memoryUsage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SoftwareDto {
        private Long id;
        private String name;
        private String version;
        private String publisher;
        private String installDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NetworkInterfaceDto {
        private Long id;
        private String interfaceName;
        private String ipAddress;
        private String macAddress;
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricDto {
        private Long id;
        private Double cpuUsage;
        private Double ramUsage;
        private Double diskUsage;
        private LocalDateTime timestamp;
    }
}
