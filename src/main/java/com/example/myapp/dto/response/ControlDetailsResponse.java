package com.example.myapp.dto.response;
import com.example.myapp.model.ComplianceControl;
import java.time.LocalDateTime;
public record ControlDetailsResponse(Long id, String controlId, String requirement, String description, String framework, String category, String status, String risk, String evidence, String comments, String owner, LocalDateTime createdAt, LocalDateTime lastUpdated) {
 public static ControlDetailsResponse from(ComplianceControl c) { return new ControlDetailsResponse(c.getId(), c.getControlId(), c.getRequirement(), c.getDescription(), c.getFramework(), c.getCategory(), c.getStatus(), c.getRisk(), c.getEvidence(), c.getComments(), c.getOwner(), c.getCreatedAt(), c.getLastUpdated()); }
}
