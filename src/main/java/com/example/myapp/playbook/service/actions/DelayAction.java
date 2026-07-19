package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import org.springframework.stereotype.Component;

/**
 * Introduces a configurable delay between playbook steps.
 * The delay is capped at 60 seconds to prevent runaway executions.
 */
@Component
public class DelayAction implements ActionExecutor {

    private static final int MAX_DELAY_SECONDS = 60;

    @Override
    public ActionType getActionType() {
        return ActionType.DELAY;
    }

    @Override
    public String execute(ActionContext context) throws Exception {
        int seconds = parseSeconds(context.getParameter("seconds", "5"));
        int effectiveDelay = Math.min(seconds, MAX_DELAY_SECONDS);
        try {
            Thread.sleep(effectiveDelay * 1000L);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new Exception("Delay step interrupted after " + effectiveDelay + "s", e);
        }
        return String.format("Delayed execution by %d second(s).", effectiveDelay);
    }

    private int parseSeconds(String value) {
        try {
            int parsed = Integer.parseInt(value);
            return Math.max(1, parsed);
        } catch (NumberFormatException e) {
            return 5;
        }
    }
}
