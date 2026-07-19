package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Simulates calling an external REST API endpoint as part of a playbook step.
 */
@Component
public class CallRestApiAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.CALL_REST_API;
    }

    @Override
    public String execute(ActionContext context) {
        String url = context.getParameter("url", "https://api.example.com/endpoint");
        String method = context.getParameter("method", "POST");
        return String.format("REST API call [%s %s] executed successfully. Response: 200 OK.", method, url);
    }
}
