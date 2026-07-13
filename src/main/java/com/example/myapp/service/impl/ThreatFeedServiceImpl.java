package com.example.myapp.service.impl;

import com.example.myapp.model.ThreatFeed;
import com.example.myapp.repository.ThreatFeedRepository;
import com.example.myapp.service.ThreatFeedService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class ThreatFeedServiceImpl implements ThreatFeedService {

    @Autowired
    private ThreatFeedRepository threatFeedRepository;

    @PostConstruct
    public void init() {
        loadMockFeeds();
    }

    @Override
    public ThreatFeed saveThreatFeed(ThreatFeed feed) {
        if (threatFeedRepository.findByValue(feed.getValue()).isPresent()) {
            return threatFeedRepository.findByValue(feed.getValue()).get();
        }
        return threatFeedRepository.save(feed);
    }

    @Override
    public List<ThreatFeed> getAllThreatFeeds() {
        return threatFeedRepository.findAll();
    }

    @Override
    public void deleteThreatFeed(UUID id) {
        threatFeedRepository.deleteById(id);
    }

    @Override
    public void loadMockFeeds() {
        if (threatFeedRepository.count() == 0) {
            threatFeedRepository.save(new ThreatFeed(
                "185.220.101.4",
                "IP Address (Tor Exit)",
                "HIGH",
                "2026-07-10",
                "AlienVault",
                "Active Tor Exit Node scouting for open ports"
            ));
            threatFeedRepository.save(new ThreatFeed(
                "malware-c2-xyz.ru",
                "Domain Name (C2)",
                "CRITICAL",
                "2026-07-10",
                "Abuse.ch",
                "Known ransomware command and control server"
            ));
            threatFeedRepository.save(new ThreatFeed(
                "a4f9e8023c10b7f8c859d02c3882711a37c1df03",
                "File Hash (SHA256)",
                "CRITICAL",
                "2026-07-10",
                "VirusTotal",
                "Malicious downloader payload hash match"
            ));
            threatFeedRepository.save(new ThreatFeed(
                "45.89.230.12",
                "IP Address (Brute Force Source)",
                "MEDIUM",
                "2026-07-09",
                "Internal Logs",
                "Repeated failed SSH attempts matching crawler patterns"
            ));
        }
    }
}
