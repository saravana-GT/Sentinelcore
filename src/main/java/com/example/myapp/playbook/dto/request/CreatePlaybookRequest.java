package com.example.myapp.playbook.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Request payload for creating a new playbook.
 */
@Getter
@Setter
public class CreatePlaybookRequest {

    @NotBlank(message = "Playbook name must not be blank")
    @Size(max = 150, message = "Playbook name must not exceed 150 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotBlank(message = "createdBy must not be blank")
    @Size(max = 100)
    private String createdBy;

    @Valid
    private List<PlaybookStepRequest> steps = new ArrayList<>();
}
