package com.example.myapp.playbook.enums;

/**
 * Defines all supported action types that a playbook step can execute.
 * Each type maps to a concrete {@link com.example.myapp.playbook.service.actions.ActionExecutor} implementation.
 */
public enum ActionType {
    NOTIFY_ANALYST,
    UPDATE_INCIDENT,
    ADD_INCIDENT_COMMENT,
    BLOCK_IP,
    ISOLATE_HOST,
    DISABLE_USER,
    GENERATE_REPORT,
    DELAY,
    CALL_REST_API,
    RUN_SCRIPT,
    LOG_MESSAGE,
    CUSTOM_ACTION
}
