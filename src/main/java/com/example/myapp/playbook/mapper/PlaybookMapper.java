package com.example.myapp.playbook.mapper;

import com.example.myapp.playbook.dto.request.PlaybookStepRequest;
import com.example.myapp.playbook.dto.response.ExecutionLogResponse;
import com.example.myapp.playbook.dto.response.ExecutionResponse;
import com.example.myapp.playbook.dto.response.PlaybookResponse;
import com.example.myapp.playbook.dto.response.PlaybookStepResponse;
import com.example.myapp.playbook.entity.ExecutionLog;
import com.example.myapp.playbook.entity.Playbook;
import com.example.myapp.playbook.entity.PlaybookExecution;
import com.example.myapp.playbook.entity.PlaybookStep;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Manual mapper between domain entities and DTOs.
 * No MapStruct — all conversions are explicit and fully controlled.
 */
@Component
public class PlaybookMapper {

    public PlaybookResponse toPlaybookResponse(Playbook playbook) {
        return PlaybookResponse.builder()
                .id(playbook.getId())
                .name(playbook.getName())
                .description(playbook.getDescription())
                .enabled(playbook.isEnabled())
                .createdBy(playbook.getCreatedBy())
                .createdAt(playbook.getCreatedAt())
                .updatedAt(playbook.getUpdatedAt())
                .steps(toStepResponseList(playbook.getSteps()))
                .build();
    }

    public List<PlaybookResponse> toPlaybookResponseList(List<Playbook> playbooks) {
        return playbooks.stream().map(this::toPlaybookResponse).collect(Collectors.toList());
    }

    public PlaybookStepResponse toStepResponse(PlaybookStep step) {
        return PlaybookStepResponse.builder()
                .id(step.getId())
                .stepOrder(step.getStepOrder())
                .actionType(step.getActionType())
                .displayName(step.getDisplayName())
                .description(step.getDescription())
                .parameters(step.getParameters())
                .timeoutSeconds(step.getTimeoutSeconds())
                .continueOnFailure(step.isContinueOnFailure())
                .enabled(step.isEnabled())
                .build();
    }

    public List<PlaybookStepResponse> toStepResponseList(List<PlaybookStep> steps) {
        if (steps == null) return Collections.emptyList();
        return steps.stream().map(this::toStepResponse).collect(Collectors.toList());
    }

    public PlaybookStep toStepEntity(PlaybookStepRequest request, Playbook playbook) {
        return PlaybookStep.builder()
                .playbook(playbook)
                .stepOrder(request.getStepOrder())
                .actionType(request.getActionType())
                .displayName(request.getDisplayName())
                .description(request.getDescription())
                .parameters(request.getParameters())
                .timeoutSeconds(request.getTimeoutSeconds())
                .continueOnFailure(request.isContinueOnFailure())
                .enabled(request.isEnabled())
                .build();
    }

    public ExecutionResponse toExecutionResponse(PlaybookExecution execution) {
        return ExecutionResponse.builder()
                .id(execution.getId())
                .playbookId(execution.getPlaybook().getId())
                .playbookName(execution.getPlaybook().getName())
                .incidentId(execution.getIncidentId())
                .alertId(execution.getAlertId())
                .initiatedBy(execution.getInitiatedBy())
                .status(execution.getStatus())
                .startedAt(execution.getStartedAt())
                .completedAt(execution.getCompletedAt())
                .executionDuration(execution.getExecutionDuration())
                .logs(toLogResponseList(execution.getLogs()))
                .build();
    }

    public List<ExecutionResponse> toExecutionResponseList(List<PlaybookExecution> executions) {
        return executions.stream().map(this::toExecutionResponse).collect(Collectors.toList());
    }

    public ExecutionLogResponse toLogResponse(ExecutionLog log) {
        return ExecutionLogResponse.builder()
                .id(log.getId())
                .stepOrder(log.getStepOrder())
                .actionType(log.getActionType())
                .status(log.getStatus())
                .message(log.getMessage())
                .errorMessage(log.getErrorMessage())
                .startedAt(log.getStartedAt())
                .completedAt(log.getCompletedAt())
                .duration(log.getDuration())
                .build();
    }

    public List<ExecutionLogResponse> toLogResponseList(List<ExecutionLog> logs) {
        if (logs == null) return Collections.emptyList();
        return logs.stream().map(this::toLogResponse).collect(Collectors.toList());
    }
}
