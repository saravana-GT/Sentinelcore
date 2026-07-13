package com.example.myapp.service;

import com.example.myapp.model.Alert;
import java.util.List;

public interface AlertService {
    Alert saveAlert(Alert alert);
    List<Alert> getAllAlerts();
}
