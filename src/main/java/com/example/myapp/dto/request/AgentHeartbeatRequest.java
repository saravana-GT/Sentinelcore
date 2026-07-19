package com.example.myapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentHeartbeatRequest {

    @NotBlank(message = "Hostname is required")
    private String hostname;

    private String ipAddress;
}
