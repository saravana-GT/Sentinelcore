package com.example.myapp.service;

import com.example.myapp.model.ThreatFeed;
import java.util.List;
import java.util.UUID;

public interface ThreatFeedService {
    ThreatFeed saveThreatFeed(ThreatFeed feed);
    List<ThreatFeed> getAllThreatFeeds();
    void deleteThreatFeed(UUID id);
    void loadMockFeeds();
}
