package com.example.myapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "compliance_controls")
public class ComplianceControl {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String controlId;
    @Column(nullable = false) private String requirement;
    @Column(length = 4000) private String description;
    private String framework;
    private String category;
    @Column(nullable = false) private String status = "WARNING";
    private String risk;
    @Column(length = 4000) private String evidence;
    @Column(length = 4000) private String comments;
    private String owner;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    @PrePersist void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); if (lastUpdated == null) lastUpdated = LocalDateTime.now(); }
    @PreUpdate void onUpdate() { lastUpdated = LocalDateTime.now(); }
    public Long getId() { return id; } public String getControlId() { return controlId; } public void setControlId(String value) { controlId = value; }
    public String getRequirement() { return requirement; } public void setRequirement(String value) { requirement = value; }
    public String getDescription() { return description; } public void setDescription(String value) { description = value; }
    public String getFramework() { return framework; } public void setFramework(String value) { framework = value; }
    public String getCategory() { return category; } public void setCategory(String value) { category = value; }
    public String getStatus() { return status; } public void setStatus(String value) { status = value; }
    public String getRisk() { return risk; } public void setRisk(String value) { risk = value; }
    public String getEvidence() { return evidence; } public void setEvidence(String value) { evidence = value; }
    public String getComments() { return comments; } public void setComments(String value) { comments = value; }
    public String getOwner() { return owner; } public void setOwner(String value) { owner = value; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime value) { createdAt = value; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime value) { lastUpdated = value; }
}
