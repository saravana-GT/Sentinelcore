package com.example.myapp.service;

import com.example.myapp.dto.request.AssetRequest;
import com.example.myapp.dto.response.AssetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface AssetService {
    AssetResponse createAsset(AssetRequest request);
    AssetResponse getAssetById(Long id);
    Page<AssetResponse> getAssets(String search, String type, String criticality, String status, String agentStatus, Pageable pageable);
    AssetResponse updateAsset(Long id, AssetRequest request);
    void deleteAsset(Long id);
    void importAssets(MultipartFile file) throws IOException;
    byte[] exportAssetsToCsv() throws IOException;
}
