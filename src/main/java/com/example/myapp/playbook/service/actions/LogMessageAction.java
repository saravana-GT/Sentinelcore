package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Writes a structured log message to the execution audit trail.
 */
@Component
public class LogMessageAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.LOG_MESSAGE;
    }

    @Override
    public String execute(ActionContext context) {
        String level = context.getParameter("level", "INFO");
        String message = context.getParameter("message", "Playbook step executed.");
        return String.format("[%s] %s — execution [%d], step [%d].",
                level, message, context.getExecutionId(), context.getStepOrder());
    }
}
