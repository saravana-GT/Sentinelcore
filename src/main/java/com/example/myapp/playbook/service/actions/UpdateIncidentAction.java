package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Simulates updating an incident record with a new status or severity.
 */
@Component
public class UpdateIncidentAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.UPDATE_INCIDENT;
    }

    @Override
    public String execute(ActionContext context) {
        String status = context.getParameter("status", "IN_PROGRESS");
        String severity = context.getParameter("severity", "HIGH");
        Long incidentId = context.getIncidentId();
        return String.format("Incident [%s] updated — status: %s, severity: %s.",
                incidentId != null ? incidentId : "N/A", status, severity);
    }
}
