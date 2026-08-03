package com.example.myapp.playbook.config;

import com.example.myapp.playbook.entity.Playbook;
import com.example.myapp.playbook.entity.PlaybookStep;
import com.example.myapp.playbook.enums.ActionType;
import com.example.myapp.playbook.repository.PlaybookRepository;
import com.example.myapp.model.Alert;
import com.example.myapp.repository.AlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds the database with three sample playbooks on application startup.
 * Skips seeding if playbooks already exist to support idempotent restarts.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final PlaybookRepository playbookRepository;
    private final AlertRepository alertRepository;

    public DataSeeder(PlaybookRepository playbookRepository, AlertRepository alertRepository) {
        this.playbookRepository = playbookRepository;
        this.alertRepository = alertRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (playbookRepository.count() > 0) {
            log.info("DataSeeder: playbooks already present — skipping seed.");
        } else {
            playbookRepository.saveAll(List.of(
                    buildMalwareResponsePlaybook(),
                    buildPhishingResponsePlaybook(),
                    buildSuspiciousLoginPlaybook()
            ));
            log.info("DataSeeder: 3 sample playbooks inserted successfully.");
        }
    }

    private void seedAlerts() {
        Alert alert1 = new Alert();
        alert1.setTitle("Tor Node outbound traffic blocked");
        alert1.setDescription("Outbound connection to Tor exit node blocked on DMZ-WAF-01");
        alert1.setSeverity("CRITICAL");
        alert1.setSource("firewall");

        Alert alert2 = new Alert();
        alert2.setTitle("Failed password login");
        alert2.setDescription("Multiple failed SSH login attempts detected on PROD-DB-01");
        alert2.setSeverity("HIGH");
        alert2.setSource("auth");

        Alert alert3 = new Alert();
        alert3.setTitle("File Integrity Monitor alert");
        alert3.setDescription("/etc/shadow configuration file was modified by unauthorized user");
        alert3.setSeverity("CRITICAL");
        alert3.setSource("endpoint");

        Alert alert4 = new Alert();
        alert4.setTitle("Network Scan blocked");
        alert4.setDescription("Port scanning attempt from WAN blocked by internal IPS rule");
        alert4.setSeverity("MEDIUM");
        alert4.setSource("ids");

        Alert alert5 = new Alert();
        alert5.setTitle("New promiscuous mode interface");
        alert5.setDescription("Network interface eth0 entered promiscuous mode on CORP-DC-01");
        alert5.setSeverity("HIGH");
        alert5.setSource("endpoint");

        alertRepository.saveAll(List.of(alert1, alert2, alert3, alert4, alert5));
        log.info("DataSeeder: 5 sample alerts inserted successfully.");
    }

    private Playbook buildMalwareResponsePlaybook() {
        Playbook playbook = Playbook.builder()
                .name("Malware Response")
                .description("Automated response playbook for detected malware incidents.")
                .createdBy("system")
                .enabled(true)
                .build();

        playbook.getSteps().addAll(List.of(
                step(playbook, 1, ActionType.NOTIFY_ANALYST,
                        "Notify SOC Analyst",
                        "Alert the on-call analyst about the malware detection.",
                        "{\"analyst\":\"soc-team@sentinelcore.com\",\"channel\":\"email\"}"),
                step(playbook, 2, ActionType.ISOLATE_HOST,
                        "Isolate Infected Host",
                        "Quarantine the compromised endpoint from the network.",
                        "{\"hostname\":\"WORKSTATION-042\",\"policy\":\"full-isolation\"}"),
                step(playbook, 3, ActionType.BLOCK_IP,
                        "Block Malware C2 IP",
                        "Block the command-and-control server IP on the perimeter firewall.",
                        "{\"ip\":\"192.168.10.15\",\"reason\":\"malware-c2\"}"),
                step(playbook, 4, ActionType.UPDATE_INCIDENT,
                        "Update Incident Status",
                        "Set incident status to IN_PROGRESS and severity to CRITICAL.",
                        "{\"status\":\"IN_PROGRESS\",\"severity\":\"CRITICAL\"}"),
                step(playbook, 5, ActionType.ADD_INCIDENT_COMMENT,
                        "Log Automated Actions",
                        "Record all automated response actions taken.",
                        "{\"comment\":\"Automated malware response executed: host isolated, C2 IP blocked.\"}"),
                step(playbook, 6, ActionType.GENERATE_REPORT,
                        "Generate Malware Report",
                        "Produce a full incident report for the security team.",
                        "{\"reportType\":\"MALWARE_INCIDENT\",\"format\":\"PDF\"}")
        ));
        return playbook;
    }

    private Playbook buildPhishingResponsePlaybook() {
        Playbook playbook = Playbook.builder()
                .name("Phishing Response")
                .description("Automated response playbook for phishing email incidents.")
                .createdBy("system")
                .enabled(true)
                .build();

        playbook.getSteps().addAll(List.of(
                step(playbook, 1, ActionType.NOTIFY_ANALYST,
                        "Notify Security Team",
                        "Notify the security team of a confirmed phishing attempt.",
                        "{\"analyst\":\"security@sentinelcore.com\",\"channel\":\"slack\"}"),
                step(playbook, 2, ActionType.DISABLE_USER,
                        "Disable Compromised Account",
                        "Disable the user account that clicked the phishing link.",
                        "{\"username\":\"jdoe\",\"directory\":\"ActiveDirectory\"}"),
                step(playbook, 3, ActionType.BLOCK_IP,
                        "Block Phishing Domain IP",
                        "Block the IP address of the phishing domain.",
                        "{\"ip\":\"203.0.113.45\",\"reason\":\"phishing-domain\"}"),
                step(playbook, 4, ActionType.ADD_INCIDENT_COMMENT,
                        "Document Response Actions",
                        "Add a comment documenting all automated response steps.",
                        "{\"comment\":\"Phishing response: user disabled, phishing IP blocked.\"}"),
                step(playbook, 5, ActionType.CALL_REST_API,
                        "Trigger Email Quarantine",
                        "Call the email gateway API to quarantine similar phishing emails.",
                        "{\"url\":\"https://emailgw.internal/api/quarantine\",\"method\":\"POST\"}"),
                step(playbook, 6, ActionType.GENERATE_REPORT,
                        "Generate Phishing Report",
                        "Generate a phishing incident summary report.",
                        "{\"reportType\":\"PHISHING_INCIDENT\",\"format\":\"HTML\"}")
        ));
        return playbook;
    }

    private Playbook buildSuspiciousLoginPlaybook() {
        Playbook playbook = Playbook.builder()
                .name("Suspicious Login")
                .description("Automated response playbook for suspicious or anomalous login activity.")
                .createdBy("system")
                .enabled(true)
                .build();

        playbook.getSteps().addAll(List.of(
                step(playbook, 1, ActionType.LOG_MESSAGE,
                        "Log Suspicious Login Event",
                        "Write a structured audit log entry for the suspicious login.",
                        "{\"level\":\"WARN\",\"message\":\"Suspicious login detected from unknown location.\"}"),
                step(playbook, 2, ActionType.NOTIFY_ANALYST,
                        "Alert Identity Team",
                        "Notify the identity and access management team.",
                        "{\"analyst\":\"iam-team@sentinelcore.com\",\"channel\":\"pagerduty\"}"),
                step(playbook, 3, ActionType.UPDATE_INCIDENT,
                        "Escalate Incident",
                        "Update incident severity to HIGH and assign to IAM team.",
                        "{\"status\":\"ESCALATED\",\"severity\":\"HIGH\"}"),
                step(playbook, 4, ActionType.DELAY,
                        "Wait for Analyst Acknowledgement",
                        "Pause execution for 10 seconds to allow analyst review.",
                        "{\"seconds\":\"10\"}"),
                step(playbook, 5, ActionType.DISABLE_USER,
                        "Temporarily Disable Account",
                        "Disable the account pending investigation.",
                        "{\"username\":\"suspicious-user\",\"directory\":\"LDAP\"}"),
                step(playbook, 6, ActionType.ADD_INCIDENT_COMMENT,
                        "Record Investigation Notes",
                        "Add automated investigation notes to the incident.",
                        "{\"comment\":\"Suspicious login response: account disabled pending IAM review.\"}")
        ));
        return playbook;
    }

    private PlaybookStep step(Playbook playbook, int order, ActionType actionType,
                               String displayName, String description, String parameters) {
        return PlaybookStep.builder()
                .playbook(playbook)
                .stepOrder(order)
                .actionType(actionType)
                .displayName(displayName)
                .description(description)
                .parameters(parameters)
                .timeoutSeconds(30)
                .continueOnFailure(false)
                .enabled(true)
                .build();
    }
}
