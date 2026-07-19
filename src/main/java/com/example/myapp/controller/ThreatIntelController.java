package com.example.myapp.controller;

import com.example.myapp.service.ThreatIntelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/threat-intel")
public class ThreatIntelController {

    @Autowired
    private ThreatIntelService threatIntelService;

    @PostMapping("/enrich")
    public ResponseEntity<Map<String, Object>> enrichIoC(@RequestBody Map<String, String> req) {
        String type = req.getOrDefault("indicatorType", "IP");
        String value = req.getOrDefault("indicatorValue", "192.168.1.100");
        return ResponseEntity.ok(threatIntelService.enrichAlertIoC(type, value));
    }

    @GetMapping("/mitre")
    public ResponseEntity<List<Map<String, Object>>> getMitreMatrix() {
        return ResponseEntity.ok(threatIntelService.getMitreAttackMatrix());
    }

    @GetMapping("/iocs")
    public ResponseEntity<List<Map<String, Object>>> getIocs() {
        return ResponseEntity.ok(threatIntelService.getIocWatchlist());
    }
}
