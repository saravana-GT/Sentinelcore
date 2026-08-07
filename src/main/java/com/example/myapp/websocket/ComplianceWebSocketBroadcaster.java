package com.example.myapp.websocket;

import com.example.myapp.dto.response.ComplianceDashboardResponse;
import com.example.myapp.dto.response.ControlDetailsResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/** Pushes committed Compliance changes to clients already connected to the dashboard socket. */
@Component
@RequiredArgsConstructor
@Slf4j
public class ComplianceWebSocketBroadcaster {
    private final DashboardWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper;

    public void controlUpdated(ControlDetailsResponse control, ComplianceDashboardResponse dashboard) {
        if (!webSocketHandler.hasActiveSessions()) {
            return;
        }

        try {
            webSocketHandler.broadcast(objectMapper.writeValueAsString(Map.of(
                    "type", "COMPLIANCE_CONTROL_UPDATED",
                    "control", control,
                    "dashboard", dashboard
            )));
        } catch (Exception exception) {
            log.error("Unable to broadcast compliance control update: {}", exception.getMessage());
        }
    }
}
