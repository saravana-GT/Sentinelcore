package com.example.myapp.service.impl;
import com.example.myapp.dto.response.*;
import com.example.myapp.exception.ResourceNotFoundException;
import com.example.myapp.model.ComplianceControl;
import com.example.myapp.repository.ComplianceControlRepository;
import com.example.myapp.service.ComplianceService;
import com.example.myapp.websocket.ComplianceWebSocketBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.util.*;

@Service @RequiredArgsConstructor
public class ComplianceServiceImpl implements ComplianceService {
 private final ComplianceControlRepository repository;
 private final ComplianceWebSocketBroadcaster complianceWebSocketBroadcaster;
 public ComplianceDashboardResponse dashboard() {
  var controls = repository.findAll(); long total = controls.size(); long pass = count(controls,"PASS"), fail=count(controls,"FAIL"), warning=count(controls,"WARNING"), na=count(controls,"NA");
  Map<String, Long> frameworks = new TreeMap<>(); controls.forEach(c -> frameworks.merge(c.getFramework() == null ? "Unassigned" : c.getFramework(), 1L, Long::sum));
  double score = total == 0 ? 0 : Math.round((pass * 10000.0 / Math.max(1, total - na))) / 100.0;
  return new ComplianceDashboardResponse(score,total,pass,fail,warning,na,frameworks);
 }
 private long count(List<ComplianceControl> c, String status) { return c.stream().filter(x -> status.equals(x.getStatus())).count(); }
 public Page<ControlDetailsResponse> matrix(String search,String framework,String status,Pageable page) {
  Specification<ComplianceControl> spec = (root,q,cb) -> cb.conjunction();
  if(search!=null&&!search.isBlank()) spec=spec.and((r,q,cb)->cb.or(cb.like(cb.lower(r.get("controlId")),"%"+search.toLowerCase()+"%"),cb.like(cb.lower(r.get("requirement")),"%"+search.toLowerCase()+"%")));
  if(framework!=null&&!framework.isBlank()) spec=spec.and((r,q,cb)->cb.equal(r.get("framework"),framework));
  if(status!=null&&!status.isBlank()) spec=spec.and((r,q,cb)->cb.equal(r.get("status"),status));
  return repository.findAll(spec,page).map(ControlDetailsResponse::from);
 }
 public ControlDetailsResponse get(Long id) { return ControlDetailsResponse.from(repository.findById(id).orElseThrow(()->new ResourceNotFoundException("Control not found: "+id))); }
 @Transactional
 public ControlDetailsResponse updateStatus(Long id,String status) {
  var control=repository.findById(id).orElseThrow(()->new ResourceNotFoundException("Control not found: "+id));
  control.setStatus(status);
  var updated=ControlDetailsResponse.from(repository.save(control));
  var dashboard=dashboard();
  TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
   @Override public void afterCommit() { complianceWebSocketBroadcaster.controlUpdated(updated,dashboard); }
  });
  return updated;
 }
}
