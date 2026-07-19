package com.example.myapp.controller;

import com.example.myapp.service.NotificationDispatcherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationDispatcherService notificationService;

    @PostMapping("/email")
    public ResponseEntity<Map<String, Object>> sendEmail(@RequestBody Map<String, String> req) {
        String recipient = req.getOrDefault("recipient", "soc-alerts@enterprise.com");
        String subject = req.getOrDefault("subject", "P1 CRITICAL SECURITY INCIDENT DETECTED");
        String body = req.getOrDefault("body", "PowerShell abuse detected on host PROD-DB-01.");
        return ResponseEntity.ok(notificationService.dispatchEmailAlert(recipient, subject, body));
    }

    @PostMapping("/slack")
    public ResponseEntity<Map<String, Object>> sendSlack(@RequestBody Map<String, String> req) {
        String url = req.getOrDefault("webhookUrl", "https://hooks.slack.com/services/XXX");
        String title = req.getOrDefault("alertTitle", "FIM Alert: /etc/passwd modified");
        String severity = req.getOrDefault("severity", "CRITICAL");
        return ResponseEntity.ok(notificationService.dispatchSlackNotification(url, title, severity));
    }

    @PostMapping("/teams")
    public ResponseEntity<Map<String, Object>> sendTeams(@RequestBody Map<String, String> req) {
        String url = req.getOrDefault("webhookUrl", "https://outlook.office.com/webhook/XXX");
        String title = req.getOrDefault("alertTitle", "Host Isolation Enforced on CORP-DC-01");
        String severity = req.getOrDefault("severity", "HIGH");
        return ResponseEntity.ok(notificationService.dispatchTeamsNotification(url, title, severity));
    }
}
