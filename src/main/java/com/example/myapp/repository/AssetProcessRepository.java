package com.example.myapp.repository;

import com.example.myapp.model.Asset;
import com.example.myapp.model.AssetProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetProcessRepository extends JpaRepository<AssetProcess, Long> {
    List<AssetProcess> findByAsset(Asset asset);
    void deleteByAsset(Asset asset);
}
