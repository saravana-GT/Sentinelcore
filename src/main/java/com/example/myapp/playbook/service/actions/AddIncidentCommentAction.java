package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Simulates appending an automated comment to an incident timeline.
 */
@Component
public class AddIncidentCommentAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.ADD_INCIDENT_COMMENT;
    }

    @Override
    public String execute(ActionContext context) {
        String comment = context.getParameter("comment", "Automated playbook action executed.");
        Long incidentId = context.getIncidentId();
        return String.format("Comment added to incident [%s]: \"%s\"",
                incidentId != null ? incidentId : "N/A", comment);
    }
}
