package com.example.myapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "asset_network")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetNetworkInterface {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonBackReference
    private Asset asset;

    @Column(name = "interface_name", nullable = false)
    private String interfaceName;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "mac_address")
    private String macAddress;

    private String status;
}
