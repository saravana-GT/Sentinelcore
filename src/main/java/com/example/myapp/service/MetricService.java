package com.example.myapp.service;

import com.example.myapp.model.Metric;
import java.util.List;

public interface MetricService {
    Metric saveMetric(Metric metric);
    List<Metric> getLatestMetrics();
}
