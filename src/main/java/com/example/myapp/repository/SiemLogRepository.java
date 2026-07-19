package com.example.myapp.repository;

import com.example.myapp.model.SiemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface SiemLogRepository extends JpaRepository<SiemLog, Long>, JpaSpecificationExecutor<SiemLog> {

    @Modifying
    @Query("DELETE FROM SiemLog s WHERE s.timestamp < :cutoffDate")
    int deleteLogsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
}
