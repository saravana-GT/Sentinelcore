package com.example.myapp.service.impl;

import com.example.myapp.model.SiemLog;
import com.example.myapp.repository.SiemLogRepository;
import com.example.myapp.service.SiemLogService;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SiemLogServiceImpl implements SiemLogService {

    @Autowired
    private SiemLogRepository siemLogRepository;

    @PostConstruct
    public void init() {
        seedDefaultLogs();
    }

    @Override
    @Transactional
    public void seedDefaultLogs() {
        if (siemLogRepository.count() == 0) {
            List<SiemLog> sampleLogs = List.of(
                new SiemLog("WINDOWS_EVENT", "WARN", "PROD-DC-01", "4625", "An account failed to log on. Account Name: Administrator", "EventID=4625 LogonType=3 Status=0xc000006d"),
                new SiemLog("SYSMON", "CRITICAL", "CORP-WKS-04", "1", "Process Create: powershell.exe executed encoded command", "Image=C:\\Windows\\System32\\powershell.exe CommandLine=-enc AABb..."),
                new SiemLog("LINUX_SYSLOG", "INFO", "PROD-WEB-02", "101", "sshd[4120]: Accepted publickey for ubuntu from 192.168.1.50 port 52140 ssh2", "sshd: session opened for user ubuntu"),
                new SiemLog("APACHE", "WARN", "PROD-APP-01", "404", "10.0.4.12 - - [19/Jul/2026:14:00:00 +0000] \"GET /admin/config.php HTTP/1.1\" 404 1250", "GET /admin/config.php HTTP/1.1 404"),
                new SiemLog("NGINX", "ERROR", "EDGE-PROXY-01", "502", "502 Bad Gateway while connecting to upstream server 10.0.1.25:8080", "connect() failed (111: Connection refused) while connecting to upstream"),
                new SiemLog("FIREWALL", "CRITICAL", "FW-DMZ-MAIN", "DROP", "Pkt dropped: IN=eth0 OUT= SRC=185.220.101.4 DST=10.0.0.5 PROTO=TCP SPT=44120 DPT=22", "ACTION=DROP REASON=TOR_EXIT_NODE_DENY"),
                new SiemLog("VPN", "INFO", "VPN-GW-01", "TUNNEL_UP", "VPN session established for user sarah.a@sentinelcore.io from 103.21.12.4", "IPSEC SA established with client IP 10.8.0.12"),
                new SiemLog("SSH", "WARN", "PROD-DB-01", "AUTH_FAIL", "PAM 2 more authentication failures; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.14  user=root", "Failed password for root from 198.51.100.14 port 41208 ssh2")
            );
            siemLogRepository.saveAll(sampleLogs);
        }
    }

    @Override
    @Transactional
    public List<SiemLog> ingestLogs(List<SiemLog> logs) {
        return siemLogRepository.saveAll(logs);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SiemLog> searchLogs(String queryStr, String logSource, String severity, String host, Pageable pageable) {
        Specification<SiemLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (queryStr != null && !queryStr.trim().isEmpty()) {
                String pattern = "%" + queryStr.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("message")), pattern),
                    cb.like(cb.lower(root.get("rawLog")), pattern),
                    cb.like(cb.lower(root.get("host")), pattern),
                    cb.like(cb.lower(root.get("eventCode")), pattern)
                ));
            }
            if (logSource != null && !logSource.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("logSource"), logSource.trim()));
            }
            if (severity != null && !severity.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("severity"), severity.trim()));
            }
            if (host != null && !host.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("host"), host.trim()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return siemLogRepository.findAll(spec, pageable);
    }

    @Override
    @Transactional
    public int applyRetentionPolicy(int retentionDays) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        return siemLogRepository.deleteLogsOlderThan(cutoff);
    }
}
