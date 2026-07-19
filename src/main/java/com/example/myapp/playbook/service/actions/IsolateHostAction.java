package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Simulates isolating a host from the network via EDR integration.
 */
@Component
public class IsolateHostAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.ISOLATE_HOST;
    }

    @Override
    public String execute(ActionContext context) {
        String hostname = context.getParameter("hostname", "unknown-host");
        String policy = context.getParameter("policy", "full-isolation");
        return String.format("Host [%s] isolated from network. Policy applied: %s.", hostname, policy);
    }
}
