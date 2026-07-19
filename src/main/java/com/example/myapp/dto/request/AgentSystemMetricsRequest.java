package com.example.myapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentSystemMetricsRequest {

    @NotBlank(message = "Hostname is required")
    private String hostname;

    private Double cpuUsage;
    private Double ramUsage;
    private Double diskUsage;
    private String loggedUser;
    private Long uptimeSeconds;
}
