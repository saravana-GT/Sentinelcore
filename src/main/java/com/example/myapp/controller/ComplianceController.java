package com.example.myapp.controller;
import com.example.myapp.dto.request.StatusUpdateRequest;
import com.example.myapp.dto.response.*;
import com.example.myapp.service.ComplianceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor
public class ComplianceController {
 private final ComplianceService service;
 @GetMapping("/api/compliance/dashboard") public ComplianceDashboardResponse dashboard(){return service.dashboard();}
 @GetMapping("/api/compliance-matrix") public Page<ControlDetailsResponse> matrix(@RequestParam(required=false) String search,@RequestParam(required=false) String framework,@RequestParam(required=false) String status,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,@RequestParam(defaultValue="lastUpdated") String sortBy,@RequestParam(defaultValue="desc") String sortDir){ return service.matrix(search,framework,status,PageRequest.of(page,size,Sort.by(Sort.Direction.fromOptionalString(sortDir).orElse(Sort.Direction.DESC),sortBy))); }
 @GetMapping("/api/control/{id}") public ControlDetailsResponse get(@PathVariable Long id){return service.get(id);}
 @PutMapping("/api/control/{id}/status") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')") public ResponseEntity<ControlDetailsResponse> update(@PathVariable Long id,@Valid @RequestBody StatusUpdateRequest request){return ResponseEntity.ok(service.updateStatus(id,request.getStatus()));}
}
