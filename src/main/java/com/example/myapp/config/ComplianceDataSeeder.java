package com.example.myapp.config;

import com.example.myapp.model.ComplianceControl;
import com.example.myapp.repository.ComplianceControlRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/** Development-only, additive control catalogue. Existing controls are never changed. */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class ComplianceDataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(ComplianceDataSeeder.class);
    private final ComplianceControlRepository repository;

    @Override
    @Transactional
    public void run(String... args) {
        var controls = List.of(
                control("ISO-5.15", "Access control policy", "ISO 27001", "Identity and Access Management", "Access rules are established, documented, and reviewed for all information assets.", "PASS", "MEDIUM", "Quarterly access-review report Q2 2026 approved.", "Identity Governance", -90),
                control("ISO-8.9", "Configuration management", "ISO 27001", "Asset Management", "Configuration baselines are maintained and changes are approved before deployment.", "WARNING", "MEDIUM", "Baseline evidence collected; two production hosts await review.", "Platform Engineering", -55),
                control("ISO-8.15", "Logging", "ISO 27001", "Monitoring", "Security-relevant events are logged, protected, and retained under the retention policy.", "PASS", "LOW", "SIEM retention policy and ingestion health report attached.", "Security Operations", -30),
                control("ISO-8.24", "Use of cryptography", "ISO 27001", "Data Protection", "Cryptographic controls protect confidential information in transit and at rest.", "FAIL", "HIGH", "Legacy service TLS finding remains open.", "Cloud Security", -14),
                control("NIST-CSF-ID.AM-01", "Asset inventory", "NIST Cybersecurity Framework", "Identify", "Physical devices and systems within the organization are inventoried and managed.", "PASS", "MEDIUM", "CMDB reconciliation completed for the current reporting period.", "Asset Management", -80),
                control("NIST-CSF-PR.AA-01", "Identity management", "NIST Cybersecurity Framework", "Protect", "Identities and credentials are managed according to organizational policy.", "WARNING", "HIGH", "Privileged-account review has three pending remediation actions.", "Identity Governance", -41),
                control("NIST-CSF-DE.CM-01", "Continuous monitoring", "NIST Cybersecurity Framework", "Detect", "Networks and network services are monitored for potential adverse events.", "PASS", "MEDIUM", "SOC monitoring coverage report and alert tuning record attached.", "Security Operations", -22),
                control("NIST-CSF-RS.MI-01", "Incident mitigation", "NIST Cybersecurity Framework", "Respond", "Incidents are contained and mitigated using approved response procedures.", "NA", "LOW", "Not applicable: no material incident was active in the assessment period.", "Incident Response", -7),
                control("CIS-01", "Enterprise asset inventory", "CIS Controls", "Inventory and Control", "Enterprise assets are actively managed through an authoritative inventory.", "PASS", "MEDIUM", "Asset discovery export reconciled with CMDB.", "Asset Management", -76),
                control("CIS-04", "Secure configuration", "CIS Controls", "Secure Configuration", "Enterprise assets use secure configuration standards and approved baselines.", "WARNING", "MEDIUM", "Linux hardening exceptions are tracked under CAB review.", "Platform Engineering", -49),
                control("CIS-08", "Audit log management", "CIS Controls", "Audit Logging", "Audit logs are collected, reviewed, retained, and protected from unauthorized modification.", "PASS", "LOW", "Immutable storage retention and SOC review evidence verified.", "Security Operations", -19),
                control("CIS-17", "Incident response management", "CIS Controls", "Incident Response", "Incident response processes are documented, exercised, and continuously improved.", "FAIL", "HIGH", "Annual tabletop exercise is overdue.", "Incident Response", -3)
        );
        int inserted = 0;
        for (ComplianceControl control : controls) {
            if (!repository.existsByControlId(control.getControlId())) {
                repository.save(control);
                inserted++;
            }
        }
        log.info("ComplianceDataSeeder: inserted {} missing compliance controls.", inserted);
    }

    private ComplianceControl control(String id, String requirement, String framework, String category, String description, String status, String risk, String evidence, String owner, int daysAgo) {
        LocalDateTime timestamp = LocalDateTime.now().plusDays(daysAgo);
        ComplianceControl control = new ComplianceControl();
        control.setControlId(id); control.setRequirement(requirement); control.setFramework(framework); control.setCategory(category); control.setDescription(description);
        control.setStatus(status); control.setRisk(risk); control.setEvidence(evidence); control.setOwner(owner);
        control.setCreatedAt(timestamp); control.setLastUpdated(timestamp.plusDays(Math.max(1, -daysAgo / 4)));
        return control;
    }
}
