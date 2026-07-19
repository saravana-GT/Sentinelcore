package com.example.myapp.controller;

import com.example.myapp.dto.request.AssetRequest;
import com.example.myapp.dto.response.AssetResponse;
import com.example.myapp.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    public ResponseEntity<AssetResponse> createAsset(@Valid @RequestBody AssetRequest request) {
        AssetResponse response = assetService.createAsset(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetResponse> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    @GetMapping
    public ResponseEntity<Page<AssetResponse>> getAssets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String criticality,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String agentStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AssetResponse> assets = assetService.getAssets(search, type, criticality, status, agentStatus, pageable);
        return ResponseEntity.ok(assets);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetResponse> updateAsset(@PathVariable Long id, @Valid @RequestBody AssetRequest request) {
        return ResponseEntity.ok(assetService.updateAsset(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<String> importAssets(@RequestParam("file") MultipartFile file) throws IOException {
        assetService.importAssets(file);
        return ResponseEntity.ok("Assets imported successfully");
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAssets() throws IOException {
        byte[] csvData = assetService.exportAssetsToCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sentinelcore_assets.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
