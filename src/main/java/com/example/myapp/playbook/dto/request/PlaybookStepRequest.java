package com.example.myapp.playbook.dto.request;

import com.example.myapp.playbook.enums.ActionType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Request payload representing a single step within a playbook create/update request.
 */
@Getter
@Setter
public class PlaybookStepRequest {

    @Min(value = 1, message = "stepOrder must be at least 1")
    private int stepOrder;

    @NotNull(message = "actionType must not be null")
    private ActionType actionType;

    @NotBlank(message = "displayName must not be blank")
    @Size(max = 150)
    private String displayName;

    @Size(max = 2000)
    private String description;

    private String parameters;

    @Min(value = 1, message = "timeoutSeconds must be at least 1")
    @Max(value = 3600, message = "timeoutSeconds must not exceed 3600")
    private int timeoutSeconds = 30;

    private boolean continueOnFailure = false;

    private boolean enabled = true;
}
