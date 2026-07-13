package com.example.myapp.controller;

import com.example.myapp.model.Alert;
import com.example.myapp.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @PostMapping
    public ResponseEntity<Alert> saveAlert(@RequestBody Alert alert) {
        Alert response = alertService.saveAlert(alert);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        List<Alert> response = alertService.getAllAlerts();
        return ResponseEntity.ok(response);
    }
}
