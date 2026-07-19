package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Handles custom user-defined actions that do not map to a built-in action type.
 * Executes based on the {@code actionName} and {@code description} parameters.
 */
@Component
public class CustomAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.CUSTOM_ACTION;
    }

    @Override
    public String execute(ActionContext context) {
        String actionName = context.getParameter("actionName", context.getDisplayName());
        String description = context.getParameter("description", "Custom action executed.");
        return String.format("Custom action [%s] executed: %s", actionName, description);
    }
}
