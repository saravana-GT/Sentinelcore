package com.example.myapp.repository;

import com.example.myapp.model.Asset;
import com.example.myapp.model.AssetMetric;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetMetricRepository extends JpaRepository<AssetMetric, Long> {
    List<AssetMetric> findByAssetOrderByTimestampDesc(Asset asset, Pageable pageable);

    @Query("SELECT AVG(am.cpuUsage) FROM AssetMetric am WHERE am.timestamp = (SELECT MAX(am2.timestamp) FROM AssetMetric am2 WHERE am2.asset = am.asset)")
    Double getAverageCpuUsage();

    @Query("SELECT AVG(am.ramUsage) FROM AssetMetric am WHERE am.timestamp = (SELECT MAX(am2.timestamp) FROM AssetMetric am2 WHERE am2.asset = am.asset)")
    Double getAverageRamUsage();

    @Query("SELECT AVG(am.diskUsage) FROM AssetMetric am WHERE am.timestamp = (SELECT MAX(am2.timestamp) FROM AssetMetric am2 WHERE am2.asset = am.asset)")
    Double getAverageDiskUsage();
}
