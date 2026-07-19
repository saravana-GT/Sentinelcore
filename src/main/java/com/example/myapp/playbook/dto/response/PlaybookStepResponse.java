package com.example.myapp.playbook.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.example.myapp.playbook.enums.ActionType;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

/**
 * Response payload representing a single playbook step.
 */
@Getter
@Builder
@Jacksonized
public class PlaybookStepResponse {

    private Long id;
    private int stepOrder;
    private ActionType actionType;
    private String displayName;
    private String description;
    private String parameters;
    private int timeoutSeconds;
    private boolean continueOnFailure;
    private boolean enabled;
}
