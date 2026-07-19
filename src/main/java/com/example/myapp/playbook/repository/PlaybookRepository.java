package com.example.myapp.playbook.repository;

import com.example.myapp.playbook.entity.Playbook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Data access layer for {@link Playbook} entities.
 */
@Repository
public interface PlaybookRepository extends JpaRepository<Playbook, Long> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    Optional<Playbook> findByIdAndEnabledTrue(Long id);

    List<Playbook> findAllByEnabledTrue();

    @Query("SELECT p FROM Playbook p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Playbook> searchByKeyword(@Param("keyword") String keyword);
}
