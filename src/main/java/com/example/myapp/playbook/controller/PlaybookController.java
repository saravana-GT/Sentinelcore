package com.example.myapp.playbook.controller;

import com.example.myapp.playbook.dto.request.CreatePlaybookRequest;
import com.example.myapp.playbook.dto.request.UpdatePlaybookRequest;
import com.example.myapp.playbook.dto.response.PlaybookResponse;
import com.example.myapp.playbook.service.PlaybookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing playbook management endpoints.
 *
 * <p>Base path: {@code /api/playbooks}
 */
@RestController
@RequestMapping("/api/playbooks")
public class PlaybookController {

    private final PlaybookService playbookService;

    public PlaybookController(PlaybookService playbookService) {
        this.playbookService = playbookService;
    }

    /**
     * GET /api/playbooks
     * Returns all playbooks. Optionally filter by keyword.
     */
    @GetMapping
    public ResponseEntity<List<PlaybookResponse>> getAllPlaybooks(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(playbookService.searchPlaybooks(search));
        }
        return ResponseEntity.ok(playbookService.getAllPlaybooks());
    }

    /**
     * GET /api/playbooks/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PlaybookResponse> getPlaybookById(@PathVariable Long id) {
        return ResponseEntity.ok(playbookService.getPlaybookById(id));
    }

    /**
     * POST /api/playbooks
     */
    @PostMapping
    public ResponseEntity<PlaybookResponse> createPlaybook(
            @Valid @RequestBody CreatePlaybookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(playbookService.createPlaybook(request));
    }

    /**
     * PUT /api/playbooks/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<PlaybookResponse> updatePlaybook(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePlaybookRequest request) {
        return ResponseEntity.ok(playbookService.updatePlaybook(id, request));
    }

    /**
     * DELETE /api/playbooks/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaybook(@PathVariable Long id) {
        playbookService.deletePlaybook(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/playbooks/{id}/enable
     */
    @PatchMapping("/{id}/enable")
    public ResponseEntity<PlaybookResponse> enablePlaybook(@PathVariable Long id) {
        return ResponseEntity.ok(playbookService.enablePlaybook(id));
    }

    /**
     * PATCH /api/playbooks/{id}/disable
     */
    @PatchMapping("/{id}/disable")
    public ResponseEntity<PlaybookResponse> disablePlaybook(@PathVariable Long id) {
        return ResponseEntity.ok(playbookService.disablePlaybook(id));
    }
}
