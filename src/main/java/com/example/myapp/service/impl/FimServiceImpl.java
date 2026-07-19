package com.example.myapp.service.impl;

import com.example.myapp.model.Alert;
import com.example.myapp.model.FimRecord;
import com.example.myapp.repository.AlertRepository;
import com.example.myapp.repository.FimRecordRepository;
import com.example.myapp.service.FimService;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class FimServiceImpl implements FimService {

    @Autowired
    private FimRecordRepository fimRecordRepository;

    @Autowired
    private AlertRepository alertRepository;

    @PostConstruct
    public void init() {
        seedDefaultFimEvents();
    }

    @Override
    @Transactional
    public void seedDefaultFimEvents() {
        if (fimRecordRepository.count() == 0) {
            List<FimRecord> sampleEvents = List.of(
                new FimRecord("PROD-DB-01", "/etc/passwd", "ETC_PASSWD", "MODIFIED", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "CRITICAL"),
                new FimRecord("CORP-DC-01", "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", "REGISTRY", "MODIFIED", "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4", "HIGH"),
                new FimRecord("PROD-WEB-02", "C:\\Windows\\System32\\drivers\\etc\\hosts", "SYSTEM32", "MODIFIED", "7a525a746a74656641616879787a71676f6f676c652e636f6d203132372e302e", "CRITICAL"),
                new FimRecord("APP-SERVER-01", "/etc/sudoers", "CONFIG", "MODIFIED", "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", "HIGH")
            );
            fimRecordRepository.saveAll(sampleEvents);
        }
    }

    @Override
    @Transactional
    public FimRecord recordFimEvent(FimRecord record) {
        FimRecord saved = fimRecordRepository.save(record);

        // Auto-generate Security Alert for FIM modification
        Alert alert = new Alert();
        alert.setTitle("FIM Alert: Critical Path Modified on " + record.getHost());
        alert.setDescription("File Integrity Monitoring alert on " + record.getFilePath() + " [Change Type: " + record.getChangeType() + "]");
        alert.setSeverity(record.getSeverity() != null ? record.getSeverity() : "HIGH");
        alert.setSource(record.getHost() + " / FIM Engine");
        alert.setStatus("Open");
        alertRepository.save(alert);

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FimRecord> searchFimEvents(String search, String fileType, String changeType, Pageable pageable) {
        Specification<FimRecord> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("filePath")), pattern),
                    cb.like(cb.lower(root.get("host")), pattern),
                    cb.like(cb.lower(root.get("checksumHash")), pattern)
                ));
            }
            if (fileType != null && !fileType.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("fileType"), fileType.trim()));
            }
            if (changeType != null && !changeType.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("changeType"), changeType.trim()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return fimRecordRepository.findAll(spec, pageable);
    }
}
