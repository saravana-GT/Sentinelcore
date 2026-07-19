package com.example.myapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fim_records")
public class FimRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String host;

    private String filePath;

    private String fileType; // REGISTRY, SYSTEM32, ETC_PASSWD, CONFIG

    private String changeType; // MODIFIED, CREATED, DELETED, PERMISSIONS_CHANGED

    private String checksumHash;

    private String severity; // CRITICAL, HIGH, MEDIUM, LOW

    private LocalDateTime timestamp;

    public FimRecord() {
        this.timestamp = LocalDateTime.now();
        this.severity = "HIGH";
    }

    public FimRecord(String host, String filePath, String fileType, String changeType, String checksumHash, String severity) {
        this.host = host;
        this.filePath = filePath;
        this.fileType = fileType;
        this.changeType = changeType;
        this.checksumHash = checksumHash;
        this.severity = severity;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }

    public String getChecksumHash() {
        return checksumHash;
    }

    public void setChecksumHash(String checksumHash) {
        this.checksumHash = checksumHash;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
