package com.example.myapp.controller;

import com.example.myapp.model.FimRecord;
import com.example.myapp.service.FimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fim")
public class FimController {

    @Autowired
    private FimService fimService;

    @GetMapping("/events")
    public ResponseEntity<Page<FimRecord>> getFimEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false) String changeType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(fimService.searchFimEvents(search, fileType, changeType, pageable));
    }

    @PostMapping("/check")
    public ResponseEntity<FimRecord> recordCheck(@RequestBody FimRecord record) {
        return ResponseEntity.ok(fimService.recordFimEvent(record));
    }
}
