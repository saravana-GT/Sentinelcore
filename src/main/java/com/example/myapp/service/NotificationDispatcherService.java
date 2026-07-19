package com.example.myapp.service;

import java.util.Map;

public interface NotificationDispatcherService {

    Map<String, Object> dispatchEmailAlert(String recipient, String subject, String body);

    Map<String, Object> dispatchSlackNotification(String webhookUrl, String alertTitle, String severity);

    Map<String, Object> dispatchTeamsNotification(String webhookUrl, String alertTitle, String severity);
}
