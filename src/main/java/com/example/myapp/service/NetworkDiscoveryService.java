package com.example.myapp.service;

import com.example.myapp.model.NetworkScanResult;
import java.util.List;

public interface NetworkDiscoveryService {

    NetworkScanResult runSubnetDiscoveryScan(String targetSubnet, String ports);

    List<NetworkScanResult> getScanHistory();
}
