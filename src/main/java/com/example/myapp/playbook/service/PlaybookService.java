package com.example.myapp.playbook.service;

import com.example.myapp.playbook.dto.request.CreatePlaybookRequest;
import com.example.myapp.playbook.dto.request.UpdatePlaybookRequest;
import com.example.myapp.playbook.dto.response.PlaybookResponse;
import com.example.myapp.playbook.entity.Playbook;
import com.example.myapp.playbook.entity.PlaybookStep;
import com.example.myapp.playbook.exception.InvalidPlaybookException;
import com.example.myapp.playbook.exception.ResourceNotFoundException;
import com.example.myapp.playbook.mapper.PlaybookMapper;
import com.example.myapp.playbook.repository.PlaybookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Business logic for playbook lifecycle management: create, update, delete, enable, disable, search.
 */
@Service
@Transactional
public class PlaybookService {

    private final PlaybookRepository playbookRepository;
    private final PlaybookMapper playbookMapper;

    public PlaybookService(PlaybookRepository playbookRepository, PlaybookMapper playbookMapper) {
        this.playbookRepository = playbookRepository;
        this.playbookMapper = playbookMapper;
    }

    /**
     * Creates a new playbook with its ordered steps.
     *
     * @throws InvalidPlaybookException if the name is already taken or step orders are duplicated
     */
    public PlaybookResponse createPlaybook(CreatePlaybookRequest request) {
        if (playbookRepository.existsByName(request.getName())) {
            throw new InvalidPlaybookException("A playbook with name '" + request.getName() + "' already exists.");
        }
        validateStepOrders(request.getSteps().stream()
                .map(s -> s.getStepOrder()).collect(Collectors.toList()));

        Playbook playbook = Playbook.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(request.getCreatedBy())
                .enabled(true)
                .build();

        List<PlaybookStep> steps = request.getSteps().stream()
                .map(stepReq -> playbookMapper.toStepEntity(stepReq, playbook))
                .collect(Collectors.toList());
        playbook.getSteps().addAll(steps);

        return playbookMapper.toPlaybookResponse(playbookRepository.save(playbook));
    }

    /**
     * Updates an existing playbook's name, description, and replaces all steps.
     *
     * @throws ResourceNotFoundException if the playbook does not exist
     * @throws InvalidPlaybookException  if the new name conflicts or step orders are duplicated
     */
    public PlaybookResponse updatePlaybook(Long id, UpdatePlaybookRequest request) {
        Playbook playbook = findById(id);

        if (playbookRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new InvalidPlaybookException("A playbook with name '" + request.getName() + "' already exists.");
        }
        validateStepOrders(request.getSteps().stream()
                .map(s -> s.getStepOrder()).collect(Collectors.toList()));

        playbook.setName(request.getName());
        playbook.setDescription(request.getDescription());

        playbook.getSteps().clear();
        List<PlaybookStep> updatedSteps = request.getSteps().stream()
                .map(stepReq -> playbookMapper.toStepEntity(stepReq, playbook))
                .collect(Collectors.toList());
        playbook.getSteps().addAll(updatedSteps);

        return playbookMapper.toPlaybookResponse(playbookRepository.save(playbook));
    }

    /**
     * Permanently deletes a playbook and all its steps.
     *
     * @throws ResourceNotFoundException if the playbook does not exist
     */
    public void deletePlaybook(Long id) {
        Playbook playbook = findById(id);
        playbookRepository.delete(playbook);
    }

    /**
     * Enables a playbook so it can be executed.
     */
    public PlaybookResponse enablePlaybook(Long id) {
        Playbook playbook = findById(id);
        playbook.setEnabled(true);
        return playbookMapper.toPlaybookResponse(playbookRepository.save(playbook));
    }

    /**
     * Disables a playbook, preventing future executions.
     */
    public PlaybookResponse disablePlaybook(Long id) {
        Playbook playbook = findById(id);
        playbook.setEnabled(false);
        return playbookMapper.toPlaybookResponse(playbookRepository.save(playbook));
    }

    @Transactional(readOnly = true)
    public PlaybookResponse getPlaybookById(Long id) {
        return playbookMapper.toPlaybookResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public List<PlaybookResponse> getAllPlaybooks() {
        return playbookMapper.toPlaybookResponseList(playbookRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<PlaybookResponse> searchPlaybooks(String keyword) {
        return playbookMapper.toPlaybookResponseList(playbookRepository.searchByKeyword(keyword));
    }

    /**
     * Loads an enabled playbook by id, throwing if not found or disabled.
     */
    public Playbook loadEnabledPlaybook(Long id) {
        return playbookRepository.findByIdAndEnabledTrue(id)
                .orElseThrow(() -> new InvalidPlaybookException(
                        "Playbook [" + id + "] is either disabled or does not exist."));
    }

    private Playbook findById(Long id) {
        return playbookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playbook", id));
    }

    private void validateStepOrders(List<Integer> orders) {
        Set<Integer> seen = new java.util.HashSet<>();
        for (int order : orders) {
            if (!seen.add(order)) {
                throw new InvalidPlaybookException("Duplicate stepOrder detected: " + order);
            }
        }
    }
}
