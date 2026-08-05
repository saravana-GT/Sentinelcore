package com.example.myapp.dto.request;
import jakarta.validation.constraints.Pattern;
public class StatusUpdateRequest {
 @Pattern(regexp = "PASS|FAIL|WARNING|NA", message = "status must be PASS, FAIL, WARNING, or NA") private String status;
 public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
}
