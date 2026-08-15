import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startUrl = process.argv[2] || process.env.WEBSITE_URL || "https://sentinelcore-9hxu.onrender.com";
const OUTPUT_FILE = path.join(__dirname, "knowledge_base.txt");

// 1. Scrape Website URL (Cheerio)
async function scrapeUrl(url) {
  console.log(`\n--- Attempting to scrape URL: ${url} ---`);
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      timeout: 8000
    });

    const html = response.data;
    const $ = cheerio.load(html);
    $("script, style, nav, footer, header, noscript, iframe, link, svg").remove();

    let extractedText = "";
    $("h1, h2, h3, h4, p, li, blockquote, td").each((_, element) => {
      const text = $(element).text().trim().replace(/\s+/g, " ");
      if (text.length > 10) {
        extractedText += `${text}\n`;
      }
    });

    return extractedText;
  } catch (error) {
    console.log(`URL scraping warning (SPA or network limit): ${error.message}`);
    return "";
  }
}

// 2. Scan local project pages for textual context (Extracting strings and titles)
function scanLocalCodebase() {
  console.log("\n--- Scanning Local Frontend Source Files ---");
  const pagesDir = path.resolve(__dirname, "../src/pages");
  const compDir = path.resolve(__dirname, "../src/components");
  let codebaseText = "";

  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith(".jsx") || file.endsWith(".js") || file.endsWith(".json")) {
        // Skip dependencies or build files
        if (fullPath.includes("node_modules") || fullPath.includes("dist")) return;
        
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          const relPath = path.relative(path.dirname(__dirname), fullPath);
          
          // Regex to extract readable text, headers, alerts, and strings from React files
          const textMatches = [];
          
          // Extract text within tags: <h3>Something</h3>, <p>Something</p>, etc.
          const tagRegex = /<(h[1-6]|p|li|span|button|div)[^>]*>([^<]+)<\/\1>/g;
          let match;
          while ((match = tagRegex.exec(content)) !== null) {
            const val = match[2].trim();
            if (val && val.length > 5 && !val.includes("{") && !val.includes("}")) {
              textMatches.push(val);
            }
          }

          // Extract descriptive comments
          const commentRegex = /\/\/\s*(.*)/g;
          while ((match = commentRegex.exec(content)) !== null) {
            const val = match[1].trim();
            if (val && val.length > 8) {
              textMatches.push(`[Developer Comment] ${val}`);
            }
          }

          if (textMatches.length > 0) {
            codebaseText += `=== CODE COMPONENT: ${relPath} ===\n`;
            codebaseText += textMatches.join("\n");
            codebaseText += "\n\n=================================\n\n";
          }
        } catch (err) {
          console.warn(`Failed to scan ${file}: ${err.message}`);
        }
      }
    });
  }

  walkDir(pagesDir);
  walkDir(compDir);
  return codebaseText;
}

// 3. Compile platform manual (RAG specifications and knowledge base)
function getPlatformManual() {
  return `
=== WEBSITE PAGE: SentinelCore Cybersecurity Platform Overview ===
URL: https://sentinelcore-9hxu.onrender.com/dashboard/overview
Description: General dashboard telemetry, statistics, network health, CPU/RAM utilization, and security score.

## Platform Summary
SentinelCore is an advanced, enterprise-grade Security Operations Center (SOC) dashboard and Security Information and Event Management (SIEM) system. It compiles real-time telemetry from distributed monitoring agents to secure network environments.

## System Metrics
- Average CPU Utilization: ~35.4%
- Average RAM Utilization: ~62.1%
- Average Disk Utilization: ~48.0%
- Security Score: Computed dynamically based on active vulnerabilities and severity of unresolved incidents.
- Network State: Tracks assets, detects online/offline hosts, monitors port scans, and manages security policies.


=== WEBSITE PAGE: SentinelCore Asset Inventory & Host Security ===
URL: https://sentinelcore-9hxu.onrender.com/dashboard/assets
Description: Database of monitored assets, network interfaces, operating systems, and agent connections.

## Asset Telemetry
SentinelCore tracks all host devices connected to the enterprise network subnet (default subnet: 192.168.1.0/24).
- Hostnames include:
  * CORP-DC-01: Active Directory Domain Controller (Criticality: High, OS: Windows Server 2022)
  * PROD-DB-01: Production Database Server (Criticality: Critical, OS: Linux Ubuntu 22.04 LTS)
  * PROD-APP-01: Production Application Server (Criticality: High, OS: Linux RedHat)
  * STG-WEB-02: Staging Web Server (Criticality: Medium, OS: Linux Ubuntu 20.04)
  * DMZ-WAF-01: Web Application Firewall (Criticality: Critical, OS: Alpine Linux)
- Agent Status: Hosts run the SentinelCore Security Agent. The agent monitors system logs, open ports, memory usage, running processes, and network sockets. If the agent stops reporting, the host status changes to Offline.


=== WEBSITE PAGE: SentinelCore Vulnerability Management & CVEs ===
URL: https://sentinelcore-9hxu.onrender.com/dashboard/vulnerabilities
Description: Threat assessment engine tracking Common Vulnerabilities and Exposures (CVEs) on host assets.

## Vulnerability Database (CVE Details)
SentinelCore scans system packages and compares them against its threat library. The platform is currently tracking these active vulnerabilities:
- **CVE-2026-01 (Severity: Critical - CVSS 9.8)**: Remote Code Execution (RCE) in Database Parser Engine affecting host PROD-DB-01.
- **CVE-2026-03 (Severity: Critical - CVSS 9.0)**: Remote Command Execution in Web Application Firewall (WAF) admin dashboard affecting host DMZ-WAF-01.
- **CVE-2025-44 (Severity: High - CVSS 8.5)**: Privilege Escalation bypass in Active Directory affecting host CORP-DC-01.
- **CVE-2024-90 (Severity: High - CVSS 7.2)**: Deserialization of Untrusted Data in session management affecting host PROD-APP-01.
- **CVE-2026-12 (Severity: Medium - CVSS 6.8)**: Improper access control on metrics endpoints affecting host PROD-APP-01.
- **CVE-2025-18 (Severity: Medium - CVSS 5.4)**: Cross Site Scripting (XSS) in landing page form fields affecting host STG-WEB-02.
- **CVE-2026-11 (Severity: Low - CVSS 2.1)**: SSL/TLS Weak Cipher Suites enabled affecting host CORP-DC-01.
- **CVE-2025-05 (Severity: Low - CVSS 1.2)**: Server Version disclosure in HTTP response header affecting host STG-WEB-02.

## Remediation Guide
To patch these CVEs:
1. Select the affected asset under the **Vulnerability Assessment** tab.
2. Trigger the "Apply Official Security Patches" action.
3. SentinelCore's agent will run an automated SOAR playbook to upgrade packages, restrict ports, or deploy WAF rules.


=== WEBSITE PAGE: SentinelCore Security Playbooks & SOAR Automation ===
URL: https://sentinelcore-9hxu.onrender.com/dashboard/playbooks
Description: Security Orchestration, Automation, and Response (SOAR) playbooks.

## Automated Playbooks
SentinelCore provides automated response actions (SOAR playbooks) to isolate threats:
1. **Isolate Compromised Host**: Disables the network interface of the target server to prevent lateral movement. Often triggered when a Critical alert (e.g. brute-force, reverse shell) is detected.
2. **Block Offending IP on Firewall**: Adds a firewall drop rule on DMZ-WAF-01 to block malicious external IP addresses.
3. **Terminate Rogue Process**: Kills unauthorized scripts, mining pools, or suspected malware processes.
4. **Update Security Group Policies**: Enforces strict incoming rules on active assets.
5. **Enforce Multi-Factor Authentication (MFA)**: Triggers a tenant-wide setting requiring all administrative users to log in with an MFA token.


=== WEBSITE PAGE: SentinelCore SIEM Logs & Incident Triage ===
URL: https://sentinelcore-9hxu.onrender.com/dashboard/siem
Description: Log explorer, audit records, and security alert classification.

## SIEM Alerts and Severity
- **Critical (🔴)**: Immediate threat like active brute force attacks, SQL injections, or suspicious administrator logins.
- **High (🟠)**: Port scans, failed SSH login attempts from internal nodes, or suspicious script executions.
- **Medium (🟡)**: Unauthorized page access, service restarts, or minor configuration changes.
- **Low (🔵)**: Regular audits, SSL configuration warnings, or general notifications.
`;
}

async function main() {
  console.log(`Starting web crawler for: ${startUrl}`);
  
  if (fs.existsSync(OUTPUT_FILE)) {
    fs.unlinkSync(OUTPUT_FILE);
  }

  // 1. Fetch live page HTML
  const webContent = await scrapeUrl(startUrl);
  if (webContent) {
    fs.appendFileSync(OUTPUT_FILE, `=== WEBSITE SCRAPED PAGE ===\nURL: ${startUrl}\n\n${webContent}\n\n`, "utf-8");
  }

  // 2. Scan local codebase for tags and component information
  const codebaseScan = scanLocalCodebase();
  if (codebaseScan) {
    fs.appendFileSync(OUTPUT_FILE, codebaseScan, "utf-8");
  }

  // 3. Add rich platform manual content for RAG context
  const manualContent = getPlatformManual();
  fs.appendFileSync(OUTPUT_FILE, manualContent, "utf-8");

  console.log(`\nWeb crawling and indexing finished!`);
  console.log(`Knowledge base created at ${OUTPUT_FILE}`);
}

main();
