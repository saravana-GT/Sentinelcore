package com.example.myapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cves")
public class Cve {

    @Id
    @Column(name = "cve_id", nullable = false, unique = true)
    private String cveId;

    @Column(length = 2000)
    private String description;

    private Double cvssScore;

    private String severity; // CRITICAL, HIGH, MEDIUM, LOW

    private String affectedProduct;

    private String affectedVersionRange;

    private String cweId;

    @Column(length = 2000)
    private String solution;

    private LocalDateTime publishedDate;

    public Cve() {}

    public Cve(String cveId, String description, Double cvssScore, String severity, String affectedProduct, String affectedVersionRange, String solution) {
        this.cveId = cveId;
        this.description = description;
        this.cvssScore = cvssScore;
        this.severity = severity;
        this.affectedProduct = affectedProduct;
        this.affectedVersionRange = affectedVersionRange;
        this.solution = solution;
        this.publishedDate = LocalDateTime.now();
    }

    public String getCveId() {
        return cveId;
    }

    public void setCveId(String cveId) {
        this.cveId = cveId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getCvssScore() {
        return cvssScore;
    }

    public void setCvssScore(Double cvssScore) {
        this.cvssScore = cvssScore;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getAffectedProduct() {
        return affectedProduct;
    }

    public void setAffectedProduct(String affectedProduct) {
        this.affectedProduct = affectedProduct;
    }

    public String getAffectedVersionRange() {
        return affectedVersionRange;
    }

    public void setAffectedVersionRange(String affectedVersionRange) {
        this.affectedVersionRange = affectedVersionRange;
    }

    public String getCweId() {
        return cweId;
    }

    public void setCweId(String cweId) {
        this.cweId = cweId;
    }

    public String getSolution() {
        return solution;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }

    public LocalDateTime getPublishedDate() {
        return publishedDate;
    }

    public void setPublishedDate(LocalDateTime publishedDate) {
        this.publishedDate = publishedDate;
    }
}
