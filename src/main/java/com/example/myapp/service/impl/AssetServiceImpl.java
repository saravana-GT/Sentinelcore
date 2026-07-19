package com.example.myapp.service.impl;

import com.example.myapp.dto.request.AssetRequest;
import com.example.myapp.dto.response.AssetResponse;
import com.example.myapp.enums.AssetType;
import com.example.myapp.exception.ResourceNotFoundException;
import com.example.myapp.mapper.AssetMapper;
import com.example.myapp.model.Asset;
import com.example.myapp.repository.AssetRepository;
import com.example.myapp.service.AssetService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;

    @Override
    @Transactional
    public AssetResponse createAsset(AssetRequest request) {
        Asset asset = AssetMapper.toEntity(request);
        Asset saved = assetRepository.save(asset);
        return AssetMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetResponse getAssetById(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
        return AssetMapper.toResponse(asset);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponse> getAssets(String search, String type, String criticality, String status, String agentStatus, Pageable pageable) {
        Specification<Asset> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate hostP = cb.like(cb.lower(root.get("hostname")), pattern);
                Predicate deviceP = cb.like(cb.lower(root.get("deviceName")), pattern);
                Predicate ipP = cb.like(cb.lower(root.get("ipAddress")), pattern);
                Predicate macP = cb.like(cb.lower(root.get("macAddress")), pattern);
                Predicate ownerP = cb.like(cb.lower(root.get("owner")), pattern);
                Predicate deptP = cb.like(cb.lower(root.get("department")), pattern);
                predicates.add(cb.or(hostP, deviceP, ipP, macP, ownerP, deptP));
            }

            if (type != null && !type.trim().isEmpty()) {
                try {
                    AssetType assetEnum = AssetType.valueOf(type.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("assetType"), assetEnum));
                } catch (IllegalArgumentException ignored) {}
            }

            if (criticality != null && !criticality.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("criticality")), criticality.trim().toUpperCase()));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            if (agentStatus != null && !agentStatus.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("agentStatus")), agentStatus.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return assetRepository.findAll(spec, pageable).map(AssetMapper::toResponse);
    }

    @Override
    @Transactional
    public AssetResponse updateAsset(Long id, AssetRequest request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
        AssetMapper.updateEntity(asset, request);
        Asset saved = assetRepository.save(asset);
        return AssetMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAsset(Long id) {
        if (!assetRepository.existsById(id)) {
            throw new ResourceNotFoundException("Asset not found with id: " + id);
        }
        assetRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void importAssets(MultipartFile file) throws IOException {
        if (file.isEmpty()) return;
        List<Asset> assetsToSave = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                if (firstLine && line.toLowerCase().contains("hostname")) {
                    firstLine = false;
                    continue; // Skip header
                }
                firstLine = false;
                String[] parts = line.split(",");
                if (parts.length >= 2) {
                    String hostname = parts[0].trim();
                    String typeStr = parts[1].trim();
                    AssetType type = AssetType.DESKTOP;
                    try {
                        type = AssetType.valueOf(typeStr.toUpperCase());
                    } catch (Exception ignored) {}

                    String ip = parts.length > 2 ? parts[2].trim() : "127.0.0.1";
                    String mac = parts.length > 3 ? parts[3].trim() : "00:00:00:00:00:00";
                    String os = parts.length > 4 ? parts[4].trim() : "Windows 11 Pro";
                    String owner = parts.length > 5 ? parts[5].trim() : "IT Ops";
                    String dept = parts.length > 6 ? parts[6].trim() : "Infrastructure";
                    String criticality = parts.length > 7 ? parts[7].trim() : "MEDIUM";
                    String status = parts.length > 8 ? parts[8].trim() : "ACTIVE";

                    Asset asset = Asset.builder()
                            .hostname(hostname)
                            .deviceName(hostname)
                            .assetType(type)
                            .ipAddress(ip)
                            .macAddress(mac)
                            .operatingSystem(os)
                            .owner(owner)
                            .department(dept)
                            .criticality(criticality)
                            .status(status)
                            .agentStatus("UNINSTALLED")
                            .build();
                    assetsToSave.add(asset);
                }
            }
        }
        if (!assetsToSave.isEmpty()) {
            assetRepository.saveAll(assetsToSave);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportAssetsToCsv() throws IOException {
        List<Asset> assets = assetRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            // Write CSV header
            writer.println("Asset ID,Hostname,Device Name,Asset Type,IP Address,MAC Address,OS,Owner,Department,Criticality,Status,Agent Status,Last Seen");
            for (Asset a : assets) {
                writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                        a.getId(),
                        a.getHostname() != null ? a.getHostname() : "",
                        a.getDeviceName() != null ? a.getDeviceName() : "",
                        a.getAssetType() != null ? a.getAssetType().name() : "",
                        a.getIpAddress() != null ? a.getIpAddress() : "",
                        a.getMacAddress() != null ? a.getMacAddress() : "",
                        a.getOperatingSystem() != null ? a.getOperatingSystem() : "",
                        a.getOwner() != null ? a.getOwner() : "",
                        a.getDepartment() != null ? a.getDepartment() : "",
                        a.getCriticality() != null ? a.getCriticality() : "",
                        a.getStatus() != null ? a.getStatus() : "",
                        a.getAgentStatus() != null ? a.getAgentStatus() : "",
                        a.getLastSeen() != null ? a.getLastSeen().toString() : ""
                );
            }
            writer.flush();
        }
        return out.toByteArray();
    }
}
