package com.example.myapp.repository;

import com.example.myapp.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {
    Optional<Asset> findByHostname(String hostname);
    Optional<Asset> findByMacAddress(String macAddress);
    Optional<Asset> findByIpAddress(String ipAddress);

    List<Asset> findByAgentStatusAndLastSeenBefore(String agentStatus, LocalDateTime timeLimit);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.agentStatus = 'ONLINE'")
    long countOnlineAssets();

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.agentStatus = 'OFFLINE'")
    long countOfflineAssets();
}
