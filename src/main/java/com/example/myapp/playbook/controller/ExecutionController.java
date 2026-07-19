package com.example.myapp.playbook.controller;

import com.example.myapp.playbook.dto.request.ExecutePlaybookRequest;
import com.example.myapp.playbook.dto.response.ExecutionLogResponse;
import com.example.myapp.playbook.dto.response.ExecutionResponse;
import com.example.myapp.playbook.service.PlaybookExecutionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for triggering playbook executions and querying execution history.
 *
 * <p>Execution trigger: {@code POST /api/playbooks/{id}/execute}
 * <p>History queries:   {@code GET  /api/playbooks/executions/**}
 */
@RestController
@RequestMapping("/api/playbooks")
public class ExecutionController {

    private final PlaybookExecutionService executionService;

    public ExecutionController(PlaybookExecutionService executionService) {
        this.executionService = executionService;
    }

    /**
     * POST /api/playbooks/{id}/execute
     * Manually triggers execution of the specified playbook.
     */
    @PostMapping("/{id}/execute")
    public ResponseEntity<ExecutionResponse> executePlaybook(
            @PathVariable Long id,
            @Valid @RequestBody ExecutePlaybookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(executionService.executePlaybook(id, request));
    }

    /**
     * GET /api/playbooks/executions
     * Returns all execution records ordered by most recent first.
     */
    @GetMapping("/executions")
    public ResponseEntity<List<ExecutionResponse>> getAllExecutions() {
        return ResponseEntity.ok(executionService.getAllExecutions());
    }

    /**
     * GET /api/playbooks/executions/{id}
     * Returns a single execution record with its step logs.
     */
    @GetMapping("/executions/{id}")
    public ResponseEntity<ExecutionResponse> getExecutionById(@PathVariable Long id) {
        return ResponseEntity.ok(executionService.getExecutionById(id));
    }

    /**
     * GET /api/playbooks/executions/{id}/logs
     * Returns all step-level execution logs for a given execution.
     */
    @GetMapping("/executions/{id}/logs")
    public ResponseEntity<List<ExecutionLogResponse>> getExecutionLogs(@PathVariable Long id) {
        return ResponseEntity.ok(executionService.getExecutionLogs(id));
    }
}
