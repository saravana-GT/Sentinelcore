package com.example.myapp.repository;

import com.example.myapp.model.Asset;
import com.example.myapp.model.AssetSoftware;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetSoftwareRepository extends JpaRepository<AssetSoftware, Long> {
    List<AssetSoftware> findByAsset(Asset asset);
    List<AssetSoftware> findByAssetId(Long assetId);
    void deleteByAsset(Asset asset);
}
