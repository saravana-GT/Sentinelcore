package com.example.myapp.controller;

import com.example.myapp.model.KnowledgeBase;
import com.example.myapp.repository.KnowledgeBaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/knowledgebase")
@CrossOrigin(origins = "*")
public class KnowledgeBaseController {

    @Autowired
    private KnowledgeBaseRepository kbRepository;

    @GetMapping
    public ResponseEntity<List<KnowledgeBase>> getAllArticles() {
        return ResponseEntity.ok(kbRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<KnowledgeBase> saveArticle(@RequestBody KnowledgeBase article) {
        article.setCreatedAt(LocalDateTime.now());
        KnowledgeBase saved = kbRepository.save(article);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable Long id, @RequestBody KnowledgeBase updatedArticle) {
        Optional<KnowledgeBase> existing = kbRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Article not found"));
        }
        KnowledgeBase article = existing.get();
        article.setTitle(updatedArticle.getTitle());
        article.setCategory(updatedArticle.getCategory());
        article.setContent(updatedArticle.getContent());
        article.setAuthor(updatedArticle.getAuthor());
        KnowledgeBase saved = kbRepository.save(article);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        Optional<KnowledgeBase> existing = kbRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Article not found"));
        }
        kbRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Knowledge Base article deleted successfully."));
    }
}
