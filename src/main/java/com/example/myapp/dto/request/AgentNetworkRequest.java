package com.example.myapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentNetworkRequest {

    @NotBlank(message = "Hostname is required")
    private String hostname;

    private List<NetworkItem> networkInterfaces;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NetworkItem {
        private String interfaceName;
        private String ipAddress;
        private String macAddress;
        private String status;
    }
}
