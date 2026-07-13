package com.example.myapp.repository;

import com.example.myapp.model.Metric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MetricRepository extends JpaRepository<Metric, UUID> {
    List<Metric> findTop50ByOrderByCreatedAtDesc();
}
