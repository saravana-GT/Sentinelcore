package com.example.myapp.service;
import com.example.myapp.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
public interface ComplianceService { ComplianceDashboardResponse dashboard(); Page<ControlDetailsResponse> matrix(String search, String framework, String status, Pageable page); ControlDetailsResponse get(Long id); ControlDetailsResponse updateStatus(Long id, String status); }
