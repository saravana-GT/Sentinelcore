package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Simulates blocking an IP address on the perimeter firewall.
 */
@Component
public class BlockIpAction implements ActionExecutor {

    @Override
    public ActionType getActionType() {
        return ActionType.BLOCK_IP;
    }

    @Override
    public String execute(ActionContext context) {
        String ip = context.getParameter("ip", "0.0.0.0");
        String reason = context.getParameter("reason", "suspicious activity");
        return String.format("Blocking IP %s on perimeter firewall. Reason: %s.", ip, reason);
    }
}
