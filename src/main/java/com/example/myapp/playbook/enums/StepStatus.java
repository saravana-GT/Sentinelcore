package com.example.myapp.playbook.enums;

/**
 * Represents the execution status of an individual {@link com.example.myapp.playbook.entity.ExecutionLog} step.
 */
public enum StepStatus {
    PENDING,
    RUNNING,
    SUCCESS,
    FAILED,
    SKIPPED,
    TIMED_OUT
}
