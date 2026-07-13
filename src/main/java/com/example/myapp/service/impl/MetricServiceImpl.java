package com.example.myapp.service.impl;

import com.example.myapp.model.Metric;
import com.example.myapp.repository.MetricRepository;
import com.example.myapp.service.MetricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MetricServiceImpl implements MetricService {

    @Autowired
    private MetricRepository metricRepository;

    @Override
    public Metric saveMetric(Metric metric) {
        return metricRepository.save(metric);
    }

    @Override
    public List<Metric> getLatestMetrics() {
        return metricRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
