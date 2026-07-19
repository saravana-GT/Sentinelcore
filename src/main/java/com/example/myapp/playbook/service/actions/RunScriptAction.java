package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Simulates running a script (shell, Python, PowerShell) on a target host.
 */
@Component
public class RunScriptAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.RUN_SCRIPT;
    }

    @Override
    public String execute(ActionContext context) {
        String scriptName = context.getParameter("scriptName", "remediation.sh");
        String target = context.getParameter("target", "localhost");
        String interpreter = context.getParameter("interpreter", "bash");
        return String.format("Script [%s] executed via %s on target [%s]. Exit code: 0.", scriptName, interpreter, target);
    }
}
