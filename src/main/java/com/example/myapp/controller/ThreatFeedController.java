package com.example.myapp.controller;

import com.example.myapp.model.ThreatFeed;
import com.example.myapp.model.ThreatIntelligenceReport;
import com.example.myapp.service.ThreatFeedService;
import com.example.myapp.service.ThreatIntelLookupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/threats")
public class ThreatFeedController {

    @Autowired
    private ThreatFeedService threatFeedService;

    @Autowired
    private ThreatIntelLookupService threatIntelLookupService;

    @PostMapping
    public ResponseEntity<ThreatFeed> saveThreatFeed(@RequestBody ThreatFeed feed) {
        ThreatFeed response = threatFeedService.saveThreatFeed(feed);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ThreatFeed>> getAllThreatFeeds() {
        List<ThreatFeed> response = threatFeedService.getAllThreatFeeds();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-ip")
    public ResponseEntity<?> checkIpReputation(@RequestParam String ipAddress) {
        try {
            ThreatIntelligenceReport report = threatIntelLookupService.checkIpReputation(ipAddress);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, String> errResponse = new HashMap<>();
            errResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThreatFeed(@PathVariable UUID id) {
        threatFeedService.deleteThreatFeed(id);
        return ResponseEntity.noContent().build();
    }
}
