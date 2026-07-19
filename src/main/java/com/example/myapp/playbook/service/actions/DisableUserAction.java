package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Simulates disabling a user account in the identity provider (e.g., Active Directory).
 */
@Component
public class DisableUserAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.DISABLE_USER;
    }

    @Override
    public String execute(ActionContext context) {
        String username = context.getParameter("username", "unknown-user");
        String directory = context.getParameter("directory", "ActiveDirectory");
        return String.format("User account [%s] disabled in %s.", username, directory);
    }
}
