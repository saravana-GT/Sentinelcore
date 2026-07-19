package com.example.myapp.playbook.repository;

import com.example.myapp.playbook.entity.ExecutionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access layer for {@link ExecutionLog} entities.
 */
@Repository
public interface ExecutionLogRepository extends JpaRepository<ExecutionLog, Long> {

    List<ExecutionLog> findAllByExecutionIdOrderByStepOrderAsc(Long executionId);
}
