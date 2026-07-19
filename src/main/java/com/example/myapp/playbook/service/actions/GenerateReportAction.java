package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Simulates generating a security incident report.
 */
@Component
public class GenerateReportAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.GENERATE_REPORT;
    }

    @Override
    public String execute(ActionContext context) {
        String reportType = context.getParameter("reportType", "INCIDENT_SUMMARY");
        String format = context.getParameter("format", "PDF");
        Long incidentId = context.getIncidentId();
        return String.format("Report [%s] generated in %s format for incident [%s].",
                reportType, format, incidentId != null ? incidentId : "N/A");
    }
}
