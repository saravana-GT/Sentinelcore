package com.example.myapp.controller;

import com.example.myapp.model.Metric;
import com.example.myapp.service.MetricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/metrics")
public class MetricController {

    @Autowired
    private MetricService metricService;

    @PostMapping
    public ResponseEntity<Metric> saveMetric(@RequestBody Metric metric) {
        Metric response = metricService.saveMetric(metric);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Metric>> getLatestMetrics() {
        List<Metric> response = metricService.getLatestMetrics();
        return ResponseEntity.ok(response);
    }
}
