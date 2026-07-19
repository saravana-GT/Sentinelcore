package com.example.myapp.repository;

import com.example.myapp.model.FimRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FimRecordRepository extends JpaRepository<FimRecord, Long>, JpaSpecificationExecutor<FimRecord> {
}
