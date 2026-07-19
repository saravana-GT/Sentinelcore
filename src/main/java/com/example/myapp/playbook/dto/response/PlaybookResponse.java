package com.example.myapp.playbook.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response payload representing a playbook and its ordered steps.
 */
@Getter
@Builder
@Jacksonized
public class PlaybookResponse {

    private Long id;
    private String name;
    private String description;
    private boolean enabled;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PlaybookStepResponse> steps;
}
