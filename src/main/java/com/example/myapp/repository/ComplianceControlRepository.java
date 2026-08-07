package com.example.myapp.repository;
import com.example.myapp.model.ComplianceControl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface ComplianceControlRepository extends JpaRepository<ComplianceControl, Long>, JpaSpecificationExecutor<ComplianceControl> {
    boolean existsByControlId(String controlId);
}
