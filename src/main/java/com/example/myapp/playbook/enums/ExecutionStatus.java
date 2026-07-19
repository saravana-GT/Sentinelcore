package com.example.myapp.playbook.enums;

/**
 * Represents the overall lifecycle status of a {@link com.example.myapp.playbook.entity.PlaybookExecution}.
 */
public enum ExecutionStatus {
    PENDING,
    RUNNING,
    COMPLETED,
    FAILED,
    PARTIALLY_COMPLETED
}
