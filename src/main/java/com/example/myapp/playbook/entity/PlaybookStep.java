package com.example.myapp.playbook.entity;

import com.example.myapp.playbook.enums.ActionType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a single ordered step within a {@link Playbook}.
 * Each step maps to a specific {@link ActionType} and carries execution parameters as a JSON string.
 */
@Entity
@Table(name = "playbook_steps",
        uniqueConstraints = @UniqueConstraint(columnNames = {"playbook_id", "step_order"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaybookStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "playbook_id", nullable = false)
    private Playbook playbook;

    @Column(name = "step_order", nullable = false)
    private int stepOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ActionType actionType;

    @Column(nullable = false, length = 150)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * JSON string holding action-specific key-value parameters.
     * Example: {"ip":"192.168.10.15","reason":"malware"}
     */
    @Column(columnDefinition = "TEXT")
    private String parameters;

    @Column(nullable = false)
    @Builder.Default
    private int timeoutSeconds = 30;

    @Column(nullable = false)
    @Builder.Default
    private boolean continueOnFailure = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;
}
