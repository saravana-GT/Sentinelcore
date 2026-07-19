package com.example.myapp.dto.request;

import com.example.myapp.enums.AssetType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentRegisterRequest {

    @NotBlank(message = "Hostname is required")
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
}
