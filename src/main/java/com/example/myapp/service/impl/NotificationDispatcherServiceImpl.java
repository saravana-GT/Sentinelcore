package com.example.myapp.service.impl;

import com.example.myapp.service.NotificationDispatcherService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationDispatcherServiceImpl implements NotificationDispatcherService {

    @Override
    public Map<String, Object> dispatchEmailAlert(String recipient, String subject, String body) {
        Map<String, Object> response = new HashMap<>();
        response.put("channel", "EMAIL");
        response.put("recipient", recipient != null ? recipient : "soc-alerts@enterprise.com");
        response.put("status", "DELIVERED");
        response.put("timestamp", LocalDateTime.now());
        return response;
    }

    @Override
    public Map<String, Object> dispatchSlackNotification(String webhookUrl, String alertTitle, String severity) {
        Map<String, Object> response = new HashMap<>();
        response.put("channel", "SLACK");
        response.put("alertTitle", alertTitle);
        response.put("severity", severity);
        response.put("status", "DELIVERED");
        response.put("timestamp", LocalDateTime.now());
        return response;
    }

    @Override
    public Map<String, Object> dispatchTeamsNotification(String webhookUrl, String alertTitle, String severity) {
        Map<String, Object> response = new HashMap<>();
        response.put("channel", "MS_TEAMS");
        response.put("alertTitle", alertTitle);
        response.put("severity", severity);
        response.put("status", "DELIVERED");
        response.put("timestamp", LocalDateTime.now());
        return response;
    }
}
