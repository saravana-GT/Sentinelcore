package com.example.myapp.repository;

import com.example.myapp.model.KnowledgeBase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, Long> {
    List<KnowledgeBase> findAllByOrderByCreatedAtDesc();
}
