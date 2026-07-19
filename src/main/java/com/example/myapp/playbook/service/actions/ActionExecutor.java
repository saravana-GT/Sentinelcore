package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;

/**
 * Strategy interface for all playbook action implementations.
 * Each concrete class handles exactly one {@link ActionType}.
 * The {@link com.example.myapp.playbook.service.actions.ActionFactory} resolves the correct
 * implementation at runtime, ensuring the runner never uses switch-case logic.
 */
public interface ActionExecutor {

    /**
     * Returns the {@link ActionType} this executor handles.
     */
    ActionType getActionType();

    /**
     * Executes the action using the provided context.
     *
     * @param context runtime data including parameters, incident id, and alert id
     * @return a human-readable result message describing what was performed
     * @throws Exception if the action fails and the failure should be recorded
     */
    String execute(ActionContext context) throws Exception;
}
