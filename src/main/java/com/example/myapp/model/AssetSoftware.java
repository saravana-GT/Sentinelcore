package com.example.myapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "asset_software")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetSoftware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonBackReference
    private Asset asset;

    @Column(nullable = false)
    private String name;

    private String version;
    private String publisher;

    @Column(name = "install_date")
    private String installDate;
}
