package com.example.myapp.service;

import com.example.myapp.model.FimRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FimService {

    void seedDefaultFimEvents();

    FimRecord recordFimEvent(FimRecord record);

    Page<FimRecord> searchFimEvents(String search, String fileType, String changeType, Pageable pageable);
}
