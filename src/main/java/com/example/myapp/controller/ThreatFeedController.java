package com.example.myapp.controller;

import com.example.myapp.model.ThreatFeed;
import com.example.myapp.service.ThreatFeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/threats")
public class ThreatFeedController {

    @Autowired
    private ThreatFeedService threatFeedService;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThreatFeed(@PathVariable UUID id) {
        threatFeedService.deleteThreatFeed(id);
        return ResponseEntity.noContent().build();
    }
}
