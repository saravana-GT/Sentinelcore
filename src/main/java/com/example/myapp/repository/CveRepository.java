package com.example.myapp.repository;

import com.example.myapp.model.Cve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CveRepository extends JpaRepository<Cve, String>, JpaSpecificationExecutor<Cve> {

    Optional<Cve> findByCveId(String cveId);

    @Query("SELECT c FROM Cve c WHERE LOWER(c.affectedProduct) LIKE LOWER(CONCAT('%', :softwareName, '%'))")
    List<Cve> findMatchingCvesForSoftware(@Param("softwareName") String softwareName);
}
