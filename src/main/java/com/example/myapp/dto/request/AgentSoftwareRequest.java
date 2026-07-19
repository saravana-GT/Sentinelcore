package com.example.myapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentSoftwareRequest {

    @NotBlank(message = "Hostname is required")
    private String hostname;

    private List<SoftwareItem> softwareList;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SoftwareItem {
        private String name;
        private String version;
        private String publisher;
        private String installDate;
    }
}
