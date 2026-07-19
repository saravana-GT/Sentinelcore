package com.example.myapp.service;

import java.util.List;
import java.util.Map;

public interface ThreatIntelService {

    Map<String, Object> enrichAlertIoC(String indicatorType, String indicatorValue);

    List<Map<String, Object>> getMitreAttackMatrix();

    List<Map<String, Object>> getIocWatchlist();
}
