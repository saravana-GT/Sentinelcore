package com.example.myapp.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "threat_feeds")
public class ThreatFeed {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "indicator_value", unique = true, nullable = false)
    private String value;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String severity;

    private String date;
    private String source;
    private String description;

    public ThreatFeed() {}

    public ThreatFeed(String value, String type, String severity, String date, String source, String description) {
        this.value = value;
        this.type = type;
        this.severity = severity;
        this.date = date;
        this.source = source;
        this.description = description;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
