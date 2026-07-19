package com.example.myapp.controller;

import com.example.myapp.model.SiemLog;
import com.example.myapp.service.SiemLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/siem/logs")
public class SiemLogController {

    @Autowired
    private SiemLogService siemLogService;

    @PostMapping("/ingest")
    public ResponseEntity<List<SiemLog>> ingestLogs(@RequestBody List<SiemLog> logs) {
        return ResponseEntity.ok(siemLogService.ingestLogs(logs));
    }

    @GetMapping
    public ResponseEntity<Page<SiemLog>> searchLogs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String logSource,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String host,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(siemLogService.searchLogs(query, logSource, severity, host, pageable));
    }

    @PostMapping("/retention")
    public ResponseEntity<Map<String, Object>> applyRetention(@RequestParam(defaultValue = "90") int retentionDays) {
        int deleted = siemLogService.applyRetentionPolicy(retentionDays);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("retentionDays", retentionDays);
        res.put("deletedLogsCount", deleted);
        return ResponseEntity.ok(res);
    }
}
