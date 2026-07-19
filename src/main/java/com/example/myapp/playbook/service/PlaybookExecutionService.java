package com.example.myapp.playbook.service;

import com.example.myapp.playbook.dto.request.ExecutePlaybookRequest;
import com.example.myapp.playbook.dto.response.ExecutionLogResponse;
import com.example.myapp.playbook.dto.response.ExecutionResponse;
import com.example.myapp.playbook.entity.PlaybookExecution;
import com.example.myapp.playbook.exception.ResourceNotFoundException;
import com.example.myapp.playbook.mapper.PlaybookMapper;
import com.example.myapp.playbook.repository.ExecutionLogRepository;
import com.example.myapp.playbook.repository.PlaybookExecutionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Handles manual execution triggers and provides read access to execution history and logs.
 */
@Service
@Transactional
public class PlaybookExecutionService {

    private final PlaybookRunner playbookRunner;
    private final PlaybookExecutionRepository executionRepository;
    private final ExecutionLogRepository logRepository;
    private final PlaybookMapper playbookMapper;

    public PlaybookExecutionService(PlaybookRunner playbookRunner,
                                    PlaybookExecutionRepository executionRepository,
                                    ExecutionLogRepository logRepository,
                                    PlaybookMapper playbookMapper) {
        this.playbookRunner = playbookRunner;
        this.executionRepository = executionRepository;
        this.logRepository = logRepository;
        this.playbookMapper = playbookMapper;
    }

    /**
     * Manually triggers execution of a playbook and returns the full execution result.
     *
     * @param playbookId id of the playbook to execute
     * @param request    execution context (incidentId, alertId, initiatedBy)
     * @return execution summary with all step logs
     */
    public ExecutionResponse executePlaybook(Long playbookId, ExecutePlaybookRequest request) {
        PlaybookExecution execution = playbookRunner.execute(
                playbookId,
                request.getIncidentId(),
                request.getAlertId(),
                request.getInitiatedBy()
        );
        return playbookMapper.toExecutionResponse(execution);
    }

    @Transactional(readOnly = true)
    public List<ExecutionResponse> getAllExecutions() {
        return playbookMapper.toExecutionResponseList(
                executionRepository.findAllByOrderByStartedAtDesc());
    }

    @Transactional(readOnly = true)
    public ExecutionResponse getExecutionById(Long id) {
        PlaybookExecution execution = executionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlaybookExecution", id));
        return playbookMapper.toExecutionResponse(execution);
    }

    @Transactional(readOnly = true)
    public List<ExecutionLogResponse> getExecutionLogs(Long executionId) {
        if (!executionRepository.existsById(executionId)) {
            throw new ResourceNotFoundException("PlaybookExecution", executionId);
        }
        return playbookMapper.toLogResponseList(
                logRepository.findAllByExecutionIdOrderByStepOrderAsc(executionId));
    }
}
