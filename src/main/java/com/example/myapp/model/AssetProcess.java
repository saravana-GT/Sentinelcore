package com.example.myapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "asset_processes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetProcess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonBackReference
    private Asset asset;

    @Column(nullable = false)
    private String name;

    private Integer pid;

    @Column(name = "cpu_usage")
    private Double cpuUsage;

    @Column(name = "memory_usage")
    private Double memoryUsage;
}
