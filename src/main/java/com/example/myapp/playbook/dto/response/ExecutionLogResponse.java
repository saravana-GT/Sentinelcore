package com.example.myapp.playbook.dto.response;

import com.example.myapp.playbook.enums.ActionType;
import com.example.myapp.playbook.enums.StepStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDateTime;

/**
 * Response payload representing the execution result of a single playbook step.
 */
@Getter
@Builder
@Jacksonized
public class ExecutionLogResponse {

    private Long id;
    private int stepOrder;
    private ActionType actionType;
    private StepStatus status;
    private String message;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long duration;
}
