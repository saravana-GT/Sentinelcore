package com.example.myapp.playbook.service;

import com.example.myapp.playbook.entity.ExecutionLog;
import com.example.myapp.playbook.entity.Playbook;
import com.example.myapp.playbook.entity.PlaybookExecution;
import com.example.myapp.playbook.entity.PlaybookStep;
import com.example.myapp.playbook.enums.ExecutionStatus;
import com.example.myapp.playbook.enums.StepStatus;
import com.example.myapp.playbook.repository.ExecutionLogRepository;
import com.example.myapp.playbook.repository.PlaybookExecutionRepository;
import com.example.myapp.playbook.service.actions.ActionContext;
import com.example.myapp.playbook.service.actions.ActionExecutor;
import com.example.myapp.playbook.service.actions.ActionFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeoutException;

/**
 * Core execution engine for the Playbook Automation module.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Load and sort playbook steps by stepOrder</li>
 *   <li>Execute each enabled step sequentially via the {@link ActionFactory} strategy</li>
 *   <li>Enforce per-step timeouts</li>
 *   <li>Persist {@link ExecutionLog} for every step</li>
 *   <li>Honour {@code continueOnFailure} flags</li>
 *   <li>Persist final {@link PlaybookExecution} status and duration</li>
 * </ul>
 *
 * <p>Designed so the Alert Engine can invoke
 * {@code playbookRunner.execute(playbookId, alertId, incidentId, initiatedBy)}
 * without any HTTP layer involvement.
 */
@Service
public class PlaybookRunner {

    private static final Logger log = LoggerFactory.getLogger(PlaybookRunner.class);

    private final PlaybookService playbookService;
    private final PlaybookExecutionRepository executionRepository;
    private final ExecutionLogRepository logRepository;
    private final ActionFactory actionFactory;

    public PlaybookRunner(PlaybookService playbookService,
                          PlaybookExecutionRepository executionRepository,
                          ExecutionLogRepository logRepository,
                          ActionFactory actionFactory) {
        this.playbookService = playbookService;
        this.executionRepository = executionRepository;
        this.logRepository = logRepository;
        this.actionFactory = actionFactory;
    }

    /**
     * Entry point for manual and automated playbook execution.
     *
     * @param playbookId  id of the playbook to run
     * @param incidentId  optional incident context
     * @param alertId     optional alert context
     * @param initiatedBy user or system that triggered the execution
     * @return the persisted {@link PlaybookExecution} with all logs populated
     */
    @Transactional
    public PlaybookExecution execute(Long playbookId, Long incidentId, Long alertId, String initiatedBy) {
        Playbook playbook = playbookService.loadEnabledPlaybook(playbookId);

        PlaybookExecution execution = initExecution(playbook, incidentId, alertId, initiatedBy);
        execution = executionRepository.save(execution);

        List<PlaybookStep> sortedSteps = sortedEnabledSteps(playbook.getSteps());

        if (sortedSteps.isEmpty()) {
            return finalise(execution, ExecutionStatus.COMPLETED);
        }

        boolean anyFailed = false;
        long executionStart = System.currentTimeMillis();

        for (PlaybookStep step : sortedSteps) {
            ExecutionLog stepLog = runStep(step, execution, incidentId, alertId);
            logRepository.save(stepLog);
            execution.getLogs().add(stepLog);

            if (stepLog.getStatus() == StepStatus.FAILED || stepLog.getStatus() == StepStatus.TIMED_OUT) {
                anyFailed = true;
                if (!step.isContinueOnFailure()) {
                    log.warn("Playbook [{}] halted at step [{}] — continueOnFailure=false.",
                            playbookId, step.getStepOrder());
                    break;
                }
            }
        }

        long totalDuration = System.currentTimeMillis() - executionStart;
        ExecutionStatus finalStatus = resolveStatus(anyFailed, execution);
        execution.setExecutionDuration(totalDuration);
        return finalise(execution, finalStatus);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private PlaybookExecution initExecution(Playbook playbook, Long incidentId,
                                             Long alertId, String initiatedBy) {
        return PlaybookExecution.builder()
                .playbook(playbook)
                .incidentId(incidentId)
                .alertId(alertId)
                .initiatedBy(initiatedBy)
                .status(ExecutionStatus.RUNNING)
                .startedAt(LocalDateTime.now())
                .build();
    }

    private ExecutionLog runStep(PlaybookStep step, PlaybookExecution execution,
                                  Long incidentId, Long alertId) {
        ExecutionLog stepLog = ExecutionLog.builder()
                .execution(execution)
                .stepOrder(step.getStepOrder())
                .actionType(step.getActionType())
                .status(StepStatus.RUNNING)
                .startedAt(LocalDateTime.now())
                .build();

        long start = System.currentTimeMillis();

        try {
            ActionExecutor executor = actionFactory.getExecutor(step.getActionType());
            ActionContext context = new ActionContext(
                    execution.getPlaybook().getId(),
                    execution.getId(),
                    step.getStepOrder(),
                    step.getDisplayName(),
                    incidentId,
                    alertId,
                    step.getParameters()
            );

            String result = executeWithTimeout(executor, context, step.getTimeoutSeconds());

            stepLog.setStatus(StepStatus.SUCCESS);
            stepLog.setMessage(result);
            log.info("Step [{}] of playbook [{}] succeeded: {}",
                    step.getStepOrder(), execution.getPlaybook().getId(), result);

        } catch (TimeoutException e) {
            stepLog.setStatus(StepStatus.TIMED_OUT);
            stepLog.setErrorMessage("Step timed out after " + step.getTimeoutSeconds() + "s.");
            log.error("Step [{}] timed out.", step.getStepOrder());

        } catch (Exception e) {
            stepLog.setStatus(StepStatus.FAILED);
            stepLog.setErrorMessage(e.getMessage());
            log.error("Step [{}] failed: {}", step.getStepOrder(), e.getMessage());
        }

        long duration = System.currentTimeMillis() - start;
        stepLog.setCompletedAt(LocalDateTime.now());
        stepLog.setDuration(duration);
        return stepLog;
    }

    /**
     * Executes the action and enforces the step's timeout by running it on a virtual thread.
     * Uses Java 17 compatible approach with a dedicated thread and join timeout.
     */
    private String executeWithTimeout(ActionExecutor executor, ActionContext context,
                                       int timeoutSeconds) throws Exception {
        final String[] result = {null};
        final Exception[] thrown = {null};

        Thread worker = new Thread(() -> {
            try {
                result[0] = executor.execute(context);
            } catch (Exception e) {
                thrown[0] = e;
            }
        });
        worker.start();
        worker.join(timeoutSeconds * 1000L);

        if (worker.isAlive()) {
            worker.interrupt();
            throw new TimeoutException("Execution exceeded " + timeoutSeconds + " seconds.");
        }
        if (thrown[0] != null) {
            throw thrown[0];
        }
        return result[0];
    }

    private List<PlaybookStep> sortedEnabledSteps(List<PlaybookStep> steps) {
        return steps.stream()
                .filter(PlaybookStep::isEnabled)
                .sorted(Comparator.comparingInt(PlaybookStep::getStepOrder))
                .toList();
    }

    private ExecutionStatus resolveStatus(boolean anyFailed, PlaybookExecution execution) {
        if (!anyFailed) {
            return ExecutionStatus.COMPLETED;
        }
        long successCount = execution.getLogs().stream()
                .filter(l -> l.getStatus() == StepStatus.SUCCESS).count();
        return successCount > 0 ? ExecutionStatus.PARTIALLY_COMPLETED : ExecutionStatus.FAILED;
    }

    private PlaybookExecution finalise(PlaybookExecution execution, ExecutionStatus status) {
        execution.setStatus(status);
        execution.setCompletedAt(LocalDateTime.now());
        return executionRepository.save(execution);
    }
}
