package com.example.myapp.playbook.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Request payload for manually triggering a playbook execution.
 */
@Getter
@Setter
public class ExecutePlaybookRequest {

    private Long incidentId;

    private Long alertId;

    @NotBlank(message = "initiatedBy must not be blank")
    private String initiatedBy;
}
