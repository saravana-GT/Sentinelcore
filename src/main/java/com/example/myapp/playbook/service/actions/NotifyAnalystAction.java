package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Simulates sending a notification to a security analyst.
 */
@Component
public class NotifyAnalystAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.NOTIFY_ANALYST;
    }

    @Override
    public String execute(ActionContext context) {
        String analyst = context.getParameter("analyst", "on-call analyst");
        String channel = context.getParameter("channel", "email");
        return String.format("Notification sent to %s via %s for execution [%d] step [%d].",
                analyst, channel, context.getExecutionId(), context.getStepOrder());
    }
}
