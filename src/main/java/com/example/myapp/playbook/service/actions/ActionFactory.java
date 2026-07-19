package com.example.myapp.playbook.service.actions;

import com.example.myapp.playbook.enums.ActionType;
import com.example.myapp.playbook.exception.ExecutionException;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Resolves the correct {@link ActionExecutor} for a given {@link ActionType}.
 * All executors are auto-discovered via Spring's dependency injection — no switch-case required.
 */
@Component
public class ActionFactory {

    private final Map<ActionType, ActionExecutor> executorMap;

    public ActionFactory(List<ActionExecutor> executors) {
        executorMap = new EnumMap<>(ActionType.class);
        for (ActionExecutor executor : executors) {
            executorMap.put(executor.getActionType(), executor);
        }
    }

    /**
     * Returns the executor registered for the given action type.
     *
     * @throws ExecutionException if no executor is registered for the type
     */
    public ActionExecutor getExecutor(ActionType actionType) {
        ActionExecutor executor = executorMap.get(actionType);
        if (executor == null) {
            throw new ExecutionException("No executor registered for action type: " + actionType);
        }
        return executor;
    }
}
