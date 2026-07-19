package com.example.myapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentProcessesRequest {

    @NotBlank(message = "Hostname is required")
    private String hostname;

    private List<ProcessItem> processes;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProcessItem {
        private String name;
        private Integer pid;
        private Double cpuUsage;
        private Double memoryUsage;
    }
}
