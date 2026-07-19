package com.example.myapp.playbook.dto.response;

import com.example.myapp.playbook.enums.ExecutionStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response payload representing a complete playbook execution run with its step logs.
 */
@Getter
@Builder
@Jacksonized
public class ExecutionResponse {

    private Long id;
    private Long playbookId;
    private String playbookName;
    private Long incidentId;
    private Long alertId;
    private String initiatedBy;
    private ExecutionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long executionDuration;
    private List<ExecutionLogResponse> logs;
}
