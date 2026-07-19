package com.example.myapp.service;

import com.example.myapp.model.AuditLog;
import java.util.List;
import java.util.Map;

public interface IncidentResponseService {

    Map<String, Object> killProcess(String hostname, Integer pid, String username);

    Map<String, Object> isolateDevice(String hostname, String username);

    Map<String, Object> restartAgent(String hostname, String username);

    Map<String, Object> collectLogs(String hostname, String username);

    Map<String, Object> runScan(String hostname, String username);

    List<AuditLog> getAuditTrail();
}
