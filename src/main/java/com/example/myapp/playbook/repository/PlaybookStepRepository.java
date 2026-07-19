package com.example.myapp.playbook.repository;

import com.example.myapp.playbook.entity.PlaybookStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access layer for {@link PlaybookStep} entities.
 */
@Repository
public interface PlaybookStepRepository extends JpaRepository<PlaybookStep, Long> {

    List<PlaybookStep> findAllByPlaybookIdOrderByStepOrderAsc(Long playbookId);

    boolean existsByPlaybookIdAndStepOrder(Long playbookId, int stepOrder);

    boolean existsByPlaybookIdAndStepOrderAndIdNot(Long playbookId, int stepOrder, Long id);
}
