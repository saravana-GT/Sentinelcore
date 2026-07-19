package com.example.myapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "siem_logs")
public class SiemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;

    private String logSource; // WINDOWS_EVENT, SYSMON, LINUX_SYSLOG, APACHE, NGINX, FIREWALL, VPN, SSH

    private String severity; // INFO, WARN, ERROR, CRITICAL

    private String host;

    private String eventCode;

    @Column(length = 2000)
    private String message;

    @Column(length = 4000)
    private String rawLog;

    private LocalDateTime receivedAt;

    public SiemLog() {
        this.timestamp = LocalDateTime.now();
        this.receivedAt = LocalDateTime.now();
        this.severity = "INFO";
    }

    public SiemLog(String logSource, String severity, String host, String eventCode, String message, String rawLog) {
        this.timestamp = LocalDateTime.now();
        this.receivedAt = LocalDateTime.now();
        this.logSource = logSource;
        this.severity = severity;
        this.host = host;
        this.eventCode = eventCode;
        this.message = message;
        this.rawLog = rawLog;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getLogSource() {
        return logSource;
    }

    public void setLogSource(String logSource) {
        this.logSource = logSource;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getEventCode() {
        return eventCode;
    }

    public void setEventCode(String eventCode) {
        this.eventCode = eventCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRawLog() {
        return rawLog;
    }

    public void setRawLog(String rawLog) {
        this.rawLog = rawLog;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }
}
