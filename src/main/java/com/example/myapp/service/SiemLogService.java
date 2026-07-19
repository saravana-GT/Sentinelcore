package com.example.myapp.service;

import com.example.myapp.model.SiemLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SiemLogService {

    void seedDefaultLogs();

    List<SiemLog> ingestLogs(List<SiemLog> logs);

    Page<SiemLog> searchLogs(String query, String logSource, String severity, String host, Pageable pageable);

    int applyRetentionPolicy(int retentionDays);
}
