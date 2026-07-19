package com.example.myapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "network_scan_results")
public class NetworkScanResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String targetSubnet;

    private Integer hostsFound;

    private String scanStatus; // IN_PROGRESS, COMPLETED, FAILED

    @Column(length = 4000)
    private String summaryText;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    public NetworkScanResult() {
        this.startTime = LocalDateTime.now();
        this.scanStatus = "IN_PROGRESS";
        this.hostsFound = 0;
    }

    public NetworkScanResult(String targetSubnet) {
        this.targetSubnet = targetSubnet;
        this.startTime = LocalDateTime.now();
        this.scanStatus = "IN_PROGRESS";
        this.hostsFound = 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTargetSubnet() {
        return targetSubnet;
    }

    public void setTargetSubnet(String targetSubnet) {
        this.targetSubnet = targetSubnet;
    }

    public Integer getHostsFound() {
        return hostsFound;
    }

    public void setHostsFound(Integer hostsFound) {
        this.hostsFound = hostsFound;
    }

    public String getScanStatus() {
        return scanStatus;
    }

    public void setScanStatus(String scanStatus) {
        this.scanStatus = scanStatus;
    }

    public String getSummaryText() {
        return summaryText;
    }

    public void setSummaryText(String summaryText) {
        this.summaryText = summaryText;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
}
