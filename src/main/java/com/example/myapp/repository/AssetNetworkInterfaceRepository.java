package com.example.myapp.repository;

import com.example.myapp.model.Asset;
import com.example.myapp.model.AssetNetworkInterface;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetNetworkInterfaceRepository extends JpaRepository<AssetNetworkInterface, Long> {
    List<AssetNetworkInterface> findByAsset(Asset asset);
    void deleteByAsset(Asset asset);
}
