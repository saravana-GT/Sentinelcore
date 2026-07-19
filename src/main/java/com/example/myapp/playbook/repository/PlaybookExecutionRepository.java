package com.example.myapp.playbook.repository;

import com.example.myapp.playbook.entity.PlaybookExecution;
import com.example.myapp.playbook.enums.ExecutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access layer for {@link PlaybookExecution} entities.
 */
@Repository
public interface PlaybookExecutionRepository extends JpaRepository<PlaybookExecution, Long> {

    List<PlaybookExecution> findAllByPlaybookIdOrderByStartedAtDesc(Long playbookId);

    List<PlaybookExecution> findAllByStatusOrderByStartedAtDesc(ExecutionStatus status);

    List<PlaybookExecution> findAllByOrderByStartedAtDesc();
}
