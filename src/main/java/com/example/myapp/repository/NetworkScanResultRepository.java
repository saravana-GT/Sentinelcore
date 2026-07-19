package com.example.myapp.repository;

import com.example.myapp.model.NetworkScanResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NetworkScanResultRepository extends JpaRepository<NetworkScanResult, Long> {
}
