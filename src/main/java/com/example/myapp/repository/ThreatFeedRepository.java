package com.example.myapp.repository;

import com.example.myapp.model.ThreatFeed;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ThreatFeedRepository extends JpaRepository<ThreatFeed, UUID> {
    Optional<ThreatFeed> findByValue(String value);
}
