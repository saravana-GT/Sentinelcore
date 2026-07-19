package com.example.myapp.playbook.entity;

import com.example.myapp.playbook.enums.ExecutionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Records a single execution run of a {@link Playbook}, including timing, trigger context,
 * and the resulting {@link ExecutionStatus}.
 */
@Entity
@Table(name = "playbook_executions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaybookExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "playbook_id", nullable = false)
    private Playbook playbook;

    private Long incidentId;

    private Long alertId;

    @Column(nullable = false, length = 100)
    private String initiatedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ExecutionStatus status = ExecutionStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    /** Total execution duration in milliseconds. */
    private Long executionDuration;

    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stepOrder ASC")
    @Builder.Default
    private List<ExecutionLog> logs = new ArrayList<>();
}
