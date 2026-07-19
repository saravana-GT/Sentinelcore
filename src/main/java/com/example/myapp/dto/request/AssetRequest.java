package com.example.myapp.dto.request;

import com.example.myapp.enums.AssetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetRequest {

    @NotBlank(message = "Hostname must not be blank")
    private String hostname;

    private String deviceName;

    @NotNull(message = "Asset Type must not be null")
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

    @NotBlank(message = "Criticality must not be blank")
    private String criticality; // CRITICAL, HIGH, MEDIUM, LOW

    @NotBlank(message = "Status must not be blank")
    private String status;      // ACTIVE, INACTIVE

    private String agentStatus; // ONLINE, OFFLINE, UNINSTALLED
}
