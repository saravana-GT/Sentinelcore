package com.example.myapp.playbook.service.actions;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;

import java.util.Collections;
import java.util.Map;

/**
 * Immutable context object passed to every {@link ActionExecutor} during step execution.
 * Carries the runtime parameters parsed from the step's JSON parameter string,
 * plus the triggering incident and alert identifiers.
 */
@Getter
public class ActionContext {

    private final Long playbookId;
    private final Long executionId;
    private final int stepOrder;
    private final String displayName;
    private final Long incidentId;
    private final Long alertId;
    private final Map<String, String> parameters;

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public ActionContext(Long playbookId, Long executionId, int stepOrder,
                         String displayName, Long incidentId, Long alertId,
                         String parametersJson) {
        this.playbookId = playbookId;
        this.executionId = executionId;
        this.stepOrder = stepOrder;
        this.displayName = displayName;
        this.incidentId = incidentId;
        this.alertId = alertId;
        this.parameters = parseParameters(parametersJson);
    }

    /**
     * Returns the value for the given parameter key, or the provided default if absent.
     */
    public String getParameter(String key, String defaultValue) {
        return parameters.getOrDefault(key, defaultValue);
    }

    private Map<String, String> parseParameters(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }
}
