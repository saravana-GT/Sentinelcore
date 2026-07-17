import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import "./Dashboard.css";

let fallbackUrl = "http://localhost:5000";
if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
  fallbackUrl = "https://sentinelcore-9hxu.onrender.com";
}
const API_URL = (import.meta.env.VITE_API_URL || fallbackUrl).replace(/\/$/, "");

function Dashboard() {
  const navigate = useNavigate();

  // User details
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("ADMIN");

  // Navigation
  const [activeTab, setActiveTab] = useState("dashboard");

  // Toasts
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
  fetch("http://localhost:5000/api/knowledgebase")
    .then((res) => res.json())
    .then((data) => {
      setKnowledgeArticles(data);
    })
    .catch((err) => {
      console.error("Failed to load Knowledge Base:", err);
    });
      }, []);

  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [showAddArticle, setShowAddArticle] = useState(false);

  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "",
    content: "",
    author: ""
   });
   const [editingArticle, setEditingArticle] = useState(null);
   const [showEditArticle, setShowEditArticle] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("All");


   const saveArticle = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/knowledgebase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newArticle),
    });

    if (!response.ok) {
      alert("Failed to save article.");
      return;
    }
     
    
    // Reload articles
    const updated = await fetch("http://localhost:5000/api/knowledgebase");
    const data = await updated.json();
    setKnowledgeArticles(data);

    // Reset form
    setNewArticle({
      title: "",
      category: "",
      content: "",
      author: "",
    });

    setShowAddArticle(false);

    alert("Article added successfully!");
  } catch (err) {
    console.error(err);
    alert("Unable to connect to backend.");
  }
};

const deleteArticle = async (id) => {
  console.log("Delete clicked:", id);

  if (!window.confirm("Delete this article?")) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/knowledgebase/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      alert("Delete failed");
      return;
    }

    setKnowledgeArticles((prev) =>
      prev.filter((article) => article.id !== id)
    );

    alert("Article deleted successfully.");
  } catch (err) {
    console.error(err);
    alert("Unable to connect to backend.");
  }
};

const editArticle = (article) => {
  setEditingArticle({
    ...article,
  });

  setShowEditArticle(true);
};
const updateArticle = async () => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/knowledgebase/${editingArticle.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingArticle),
      }
    );

    if (!response.ok) {
      alert("Failed to update article.");
      return;
    }

    const res = await fetch("http://localhost:5000/api/knowledgebase");
    const data = await res.json();

    setKnowledgeArticles(data);

    setShowEditArticle(false);
    setEditingArticle(null);

    alert("Article updated successfully.");
  } catch (err) {
    console.error(err);
    alert("Unable to connect to backend.");
  }
};

  // Modals
  const [modalType, setModalType] = useState(null); // 'createIncident' | 'addAsset' | 'addUser' | 'createRule' | null

  // Inputs for modals
  const [newIncident, setNewIncident] = useState({ title: "", severity: "P2", assignee: "" });
  const [newAsset, setNewAsset] = useState({ hostname: "", ip: "", os: "Linux Ubuntu", criticality: "High", owner: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "ANALYST", team: "SOC Operations" });
  const [newRule, setNewRule] = useState({ name: "", severity: "HIGH", source: "ids", msgMatch: "" });

  // Data Stores
  const [incidents, setIncidents] = useState([
    { id: "INC-001", title: "Ransomware detected on PROD-DB-01", severity: "P1", status: "Open", assignee: "MK", assigneeColor: "#b91c1c", sla: "2h 15m", created: "2026-07-10 09:23" },
    { id: "INC-002", title: "Suspicious lateral movement in DMZ", severity: "P1", status: "Open", assignee: "JC", assigneeColor: "#c27a1b", sla: "1h 40m", created: "2026-07-10 10:05" },
    { id: "INC-003", title: "Brute force attack on VPN gateway", severity: "P2", status: "Triaged", assignee: "SA", assigneeColor: "#287a43", sla: "4h 30m", created: "2026-07-10 08:12" },
    { id: "INC-004", title: "Data exfiltration attempt via DNS tunneling", severity: "P1", status: "Triaged", assignee: "MK", assigneeColor: "#b91c1c", sla: "0h 45m", created: "2026-07-10 07:58" },
    { id: "INC-005", title: "Unauthorized admin account creation", severity: "P2", status: "In Progress", assignee: "JC", assigneeColor: "#c27a1b", sla: "6h 20m", created: "2026-07-10 08:50" },
    { id: "INC-006", title: "Phishing campaign targeting HR dept", severity: "P3", status: "In Progress", assignee: "SA", assigneeColor: "#287a43", sla: "24h 0m", created: "2026-07-10 06:10" },
    { id: "INC-007", title: "Outbound connection to known C2 server", severity: "P1", status: "Resolved", assignee: "SA", assigneeColor: "#287a43", sla: "Resolved", created: "2026-07-09 23:45" },
    { id: "INC-008", title: "SQL injection attempt blocked by WAF", severity: "P3", status: "Resolved", assignee: "JC", assigneeColor: "#c27a1b", sla: "Resolved", created: "2026-07-09 20:30" }
  ]);

  const [alerts, setAlerts] = useState([
    { id: "AL-928", name: "High rate of outbound packets", severity: "CRITICAL", source: "firewall", count: 421, firstSeen: "10m ago", status: "Open" },
    { id: "AL-927", name: "EDR alert: LSASS process memory dump", severity: "CRITICAL", source: "endpoint", count: 1, firstSeen: "18m ago", status: "Triaged" },
    { id: "AL-926", name: "Failed logins exceed threshold (Brute Force)", severity: "HIGH", source: "auth", count: 18, firstSeen: "25m ago", status: "Open" },
    { id: "AL-925", name: "Tor exit node connection", severity: "HIGH", source: "ids", count: 3, firstSeen: "1h ago", status: "Resolved" },
    { id: "AL-924", name: "Suspicious PowerShell base64 command", severity: "MEDIUM", source: "endpoint", count: 2, firstSeen: "2h ago", status: "Open" },
    { id: "AL-923", name: "Internal Port scan detected", severity: "MEDIUM", source: "firewall", count: 87, firstSeen: "3h ago", status: "Open" }
  ]);

  const [threats, setThreats] = useState([
    { value: "185.220.101.4", type: "IP Address (Tor Exit)", severity: "HIGH", date: "2026-07-10" },
    { value: "malware-c2-xyz.ru", type: "Domain Name (C2)", severity: "CRITICAL", date: "2026-07-10" },
    { value: "a4f9e8023c10b7f8c859d02c3882711a37c1df03", type: "File Hash (SHA256)", severity: "CRITICAL", date: "2026-07-10" },
    { value: "45.89.230.12", type: "IP Address (Brute Force Source)", severity: "MEDIUM", date: "2026-07-09" }
  ]);

  const [assets, setAssets] = useState([
    { hostname: "PROD-DB-01", ip: "10.0.3.50", os: "Linux Ubuntu", criticality: "Critical", owner: "DBA Team", riskScore: 92, status: "Patched", lastSeen: "5m ago" },
    { hostname: "PROD-APP-01", ip: "10.0.3.51", os: "Linux Ubuntu", criticality: "High", owner: "App Team", riskScore: 65, status: "Patched", lastSeen: "2m ago" },
    { hostname: "CORP-DC-01", ip: "10.2.1.10", os: "Win Server 2022", criticality: "Critical", owner: "IT Ops", riskScore: 78, status: "Out of Date", lastSeen: "10m ago" },
    { hostname: "DMZ-WAF-01", ip: "10.0.1.10", os: "Linux Debian", criticality: "High", owner: "NetSec", riskScore: 45, status: "Patched", lastSeen: "Active" },
    { hostname: "STG-WEB-02", ip: "10.0.5.21", os: "Linux Debian", criticality: "Medium", owner: "QA Team", riskScore: 28, status: "Patched", lastSeen: "1h ago" }
  ]);

  // SIEM logs database
  const [logs, setLogs] = useState([
    { timestamp: "11:54:12", level: "INFO", source: "firewall", message: "Outbound connection allowed to 8.8.8.8", ip: "10.0.3.51" },
    { timestamp: "11:53:05", level: "WARNING", source: "auth", message: "Failed login attempt for user 'admin'", ip: "192.168.1.18" },
    { timestamp: "11:51:24", level: "ERROR", source: "ids", message: "IDS Rule match: ET Web Attacks SQL injection", ip: "45.89.230.12" },
    { timestamp: "11:49:50", level: "INFO", source: "endpoint", message: "Process started: cmd.exe spawning powershell.exe", ip: "10.2.1.10" },
    { timestamp: "11:47:01", level: "CRITICAL", source: "endpoint", message: "Ransomware signature match detected on sector C:", ip: "10.0.3.50" }
  ]);

  // SIEM Filter States
  const [logSearch, setLogSearch] = useState("");
  const [logSeverity, setLogSeverity] = useState("");
  const [logSource, setLogSource] = useState("");

  // Audit Logs (dynamic tracking)
  const [auditLogs, setAuditLogs] = useState([]);

  // Sessions list
  const [sessions, setSessions] = useState([]);

  // Live feed updates
  const [liveFeed, setLiveFeed] = useState([
    { text: "Firewall allowed outbound HTTP from PROD-APP-01", source: "firewall", time: "11:54:30", type: "info" },
    { text: "Failed SSH login on CORP-DC-01 (Attempt 3)", source: "auth", time: "11:53:15", type: "warning" },
    { text: "IDS Alert: Port scan detected from external WAN IP", source: "ids", time: "11:52:00", type: "warning" }
  ]);

  // Vulnerability scan simulation states
  const [isScanning, setIsScanning] = useState(false);
  const [heatmapCells, setHeatmapCells] = useState([
    { id: 1, score: 9.8, class: "critical", label: "CVE-2026-01" },
    { id: 2, score: 8.5, class: "high", label: "CVE-2025-44" },
    { id: 3, score: 5.4, class: "medium", label: "CVE-2025-18" },
    { id: 4, score: 2.1, class: "low", label: "CVE-2026-11" },
    { id: 5, score: 7.2, class: "high", label: "CVE-2024-90" },
    { id: 6, score: 9.0, class: "critical", label: "CVE-2026-03" },
    { id: 7, score: 1.2, class: "low", label: "CVE-2025-05" },
    { id: 8, score: 6.8, class: "medium", label: "CVE-2026-12" }
  ]);

  // System Settings
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshRate, setRefreshRate] = useState(5);

  // Users & Teams
  const [users, setUsers] = useState([
    { name: "Sarah Anderson", email: "sarah.a@sentinelcore.io", role: "ADMIN", team: "SOC Lead", status: "Active", lastActive: "Just now" },
    { name: "Marcus Kael", email: "marcus.k@sentinelcore.io", role: "ANALYST", team: "Triage Team", status: "Active", lastActive: "12m ago" },
    { name: "John Carter", email: "john.c@sentinelcore.io", role: "ANALYST", team: "Incident Response", status: "On Shift", lastActive: "2m ago" },
    { name: "Visitor Guest", email: "visitor@sentinelcore.io", role: "VIEWER", team: "Audit Compliance", status: "Away", lastActive: "1h ago" }
  ]);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");

    if (!token) {
      navigate("/");
      return;
    }

    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setRole(storedRole);

    // Load active sessions
    const storedSessions = localStorage.getItem("sessions");
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    } else {
      const defaultSessions = [
        { id: "sess-1", device: "Windows PC · Chrome", ip: "192.168.1.100", loginTime: new Date().toLocaleString(), isCurrent: true }
      ];
      setSessions(defaultSessions);
      localStorage.setItem("sessions", JSON.stringify(defaultSessions));
    }

    // Load settings
    const storedMfa = localStorage.getItem("mfa_enabled") === "true";
    setMfaEnabled(storedMfa);

    // Initialize audit logs
    const storedAudit = localStorage.getItem("audit_logs");
    if (storedAudit) {
      setAuditLogs(JSON.parse(storedAudit));
    } else {
      const defaultAudit = [
        { timestamp: "11:32:10", user: storedUsername || "System", action: "User Session Authenticated successfully." },
        { timestamp: "10:15:00", user: "System", action: "System firewall ruleset updated successfully." }
      ];
      setAuditLogs(defaultAudit);
      localStorage.setItem("audit_logs", JSON.stringify(defaultAudit));
    }
  }, [navigate]);

  // Live feed stream simulation
  useEffect(() => {
    if (!autoRefresh) return;

    const messages = [
      "Tor Node outbound traffic blocked on DMZ-WAF-01",
      "Failed password login on PROD-DB-01",
      "File Integrity Monitor alert: /etc/shadow modified",
      "Network Scan blocked by internal IPS rule",
      "New network interface entered promiscuous mode on CORP-DC-01",
      "Authorized connection to external AWS bucket approved"
    ];
    const sources = ["firewall", "auth", "ids", "endpoint"];
    const types = ["info", "warning", "error"];

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const randomSrc = sources[Math.floor(Math.random() * sources.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      setLiveFeed((prev) => [
        { text: randomMsg, source: randomSrc, time: timeStr, type: randomType },
        ...prev.slice(0, 9)
      ]);
    }, refreshRate * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshRate]);

  // Log audit helper
  const addAuditLog = (actionText) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    const newEntry = {
      timestamp: timeStr,
      user: username || "Admin",
      action: actionText
    };
    const updated = [newEntry, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem("audit_logs", JSON.stringify(updated));
  };

  // Toast helper
  const showToast = (type, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check write capability based on role
  const checkWritePermission = () => {
    if (role === "VIEWER") {
      showToast("warning", "Access Denied: Read-only Viewer Mode is active.");
      return false;
    }
    return true;
  };

  // Modals operations
  const openModal = (type) => {
    if (!checkWritePermission()) return;
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  // Create Incident
  const handleCreateIncident = () => {
    if (!newIncident.title) {
      showToast("warning", "Please provide a valid incident title.");
      return;
    }
    const id = `INC-00${incidents.length + 1}`;
    const newEntry = {
      id,
      title: newIncident.title,
      severity: newIncident.severity,
      status: "Open",
      assignee: newIncident.assignee || "MK",
      assigneeColor: newIncident.severity === "P1" ? "#b91c1c" : "#c27a1b",
      sla: newIncident.severity === "P1" ? "1h 0m" : "4h 0m",
      created: new Date().toISOString().slice(0, 16).replace("T", " ")
    };

    setIncidents([newEntry, ...incidents]);
    addAuditLog(`Created incident registry ${id}: "${newIncident.title}"`);
    showToast("success", `Incident ${id} registered successfully.`);
    setNewIncident({ title: "", severity: "P2", assignee: "" });
    closeModal();
  };

  // Add Asset
  const handleAddAsset = () => {
    if (!newAsset.hostname || !newAsset.ip) {
      showToast("warning", "Please specify hostname and IP Address.");
      return;
    }
    const entry = {
      ...newAsset,
      riskScore: Math.floor(Math.random() * 50) + 15,
      status: "Patched",
      lastSeen: "Just now"
    };
    setAssets([entry, ...assets]);
    addAuditLog(`Registered new system asset: "${newAsset.hostname}" (${newAsset.ip})`);
    showToast("success", `Monitored asset ${newAsset.hostname} registered.`);
    setNewAsset({ hostname: "", ip: "", os: "Linux Ubuntu", criticality: "High", owner: "" });
    closeModal();
  };

  // Add User
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      showToast("warning", "Please enter name and email address.");
      return;
    }
    setUsers([...users, { ...newUser, status: "Active", lastActive: "Never" }]);
    addAuditLog(`Invited new team member: ${newUser.name} as ${newUser.role}`);
    showToast("success", `Invited user ${newUser.name} to security group.`);
    setNewUser({ name: "", email: "", role: "ANALYST", team: "SOC Operations" });
    closeModal();
  };

  // Add Detection Rule
  const handleCreateRule = () => {
    if (!newRule.name) {
      showToast("warning", "Rule name is required.");
      return;
    }
    addAuditLog(`Created SIEM detection rule: "${newRule.name}" targeting ${newRule.source}`);
    showToast("success", `Detection rule "${newRule.name}" deployed to parsing engines.`);
    setNewRule({ name: "", severity: "HIGH", source: "ids", msgMatch: "" });
    closeModal();
  };

  // Triage actions
  const acknowledgeAlert = (id) => {
    if (!checkWritePermission()) return;
    setAlerts(alerts.map((al) => (al.id === id ? { ...al, status: "Triaged" } : al)));
    addAuditLog(`Acknowledged alert queue item ${id}`);
    showToast("success", `Alert ${id} triaged to active monitor.`);
  };

  const resolveAlert = (id) => {
    if (!checkWritePermission()) return;
    setAlerts(alerts.map((al) => (al.id === id ? { ...al, status: "Resolved" } : al)));
    addAuditLog(`Resolved alert queue item ${id}`);
    showToast("success", `Alert ${id} marked as resolved.`);
  };

  // Kanban Incident Movement
  const moveIncident = (id, newStatus) => {
    if (!checkWritePermission()) return;
    setIncidents(incidents.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc)));
    addAuditLog(`Moved incident ${id} status to [${newStatus}]`);
  };

  // Vulnerability scanner run
  const runScan = () => {
    if (!checkWritePermission()) return;
    setIsScanning(true);
    showToast("info", "Vulnerability scanner initiated. Inspecting network hosts...");

    setTimeout(() => {
      // randomly update some score
      setHeatmapCells((prev) =>
        prev.map((c) => {
          const newScore = Math.min(10, Math.max(1, +(c.score + (Math.random() * 2 - 1)).toFixed(1)));
          let scoreClass = "low";
          if (newScore >= 9.0) scoreClass = "critical";
          else if (newScore >= 7.0) scoreClass = "high";
          else if (newScore >= 4.0) scoreClass = "medium";
          return { ...c, score: newScore, class: scoreClass };
        })
      );
      setIsScanning(false);
      addAuditLog("Executed network vulnerability scan against 89 monitored assets.");
      showToast("success", "Vulnerability scan completed. 8 active nodes updated.");
    }, 2000);
  };

  // Session terminations
  const terminateSession = (id) => {
    if (!checkWritePermission()) return;
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    localStorage.setItem("sessions", JSON.stringify(filtered));
    addAuditLog(`Terminated user active session token ID: ${id}`);
    showToast("success", "Target device session access terminated.");
  };

  // Settings updates
  const handleMfaToggle = () => {
    if (!checkWritePermission()) return;
    const toggled = !mfaEnabled;
    setMfaEnabled(toggled);
    localStorage.setItem("mfa_enabled", toggled ? "true" : "false");
    addAuditLog(`Multi-Factor Authentication (MFA) set to: [${toggled ? "ENABLED" : "DISABLED"}]`);
    showToast("success", `MFA configuration updated successfully.`);
  };

  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
    showToast("info", `Real-time feed updates ${!autoRefresh ? "resumed" : "paused"}.`);
  };

  // SIEM logs query filtering
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(logSearch.toLowerCase()) || log.ip.includes(logSearch);
    const matchesSeverity = logSeverity === "" || log.level === logSeverity;
    const matchesSource = logSource === "" || log.source === logSource;
    return matchesSearch && matchesSeverity && matchesSource;
  });

  return (
    <div className="app-layout">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTAINER */}
      <div className="main-content">
        {/* HEADER TOPBAR */}
        <Header 
          activeTab={activeTab} 
          onNewIncidentClick={() => openModal("createIncident")}
          showToast={showToast}
        />

        {/* PAGE CONTENT CONTAINER */}
        <div className="scroll-area">
          {/* ===== 1. DASHBOARD VIEW ===== */}
          {activeTab === "dashboard" && (
            <div className="dashboard-page">
              <div className="stats-grid">
                <div className="stat-card red">
                  <div className="stat-label">Active Incidents</div>
                  <div className="stat-value">{incidents.filter(i => i.status !== "Resolved").length}</div>
                  <div className="stat-change up">▲ 3 from yesterday</div>
                  <div className="stat-icon">🚨</div>
                </div>
                <div className="stat-card amber">
                  <div className="stat-label">Open Alerts</div>
                  <div className="stat-value">{alerts.filter(a => a.status !== "Resolved").length}</div>
                  <div className="stat-change up">▲ 7 from yesterday</div>
                  <div className="stat-icon">🔔</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-label">Risk Score</div>
                  <div className="stat-value">72</div>
                  <div className="stat-change up">▲ 4 pts increase</div>
                  <div className="stat-icon">📈</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">MTTR (Mean Time)</div>
                  <div className="stat-value">4.2<span style={{ fontSize: "14px", color: "var(--text-dim)" }}>h</span></div>
                  <div className="stat-change down">▼ 12% improved</div>
                  <div className="stat-icon">⏱️</div>
                </div>
                <div className="stat-card cyan">
                  <div className="stat-label">Monitored Assets</div>
                  <div className="stat-value">{assets.length}</div>
                  <div className="stat-change" style={{ color: "var(--text-dim)" }}>— active monitor</div>
                  <div className="stat-icon">🖥️</div>
                </div>
              </div>

              {/* Dynamic SVG Charts */}
              <div className="panels-grid">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Security Incidents Over Time</div>
                      <div className="panel-subtitle">Daily count - Last 30 days</div>
                    </div>
                    <div className="panel-actions">
                      <button className="panel-action active">30D</button>
                      <button className="panel-action">7D</button>
                      <button className="panel-action">24H</button>
                    </div>
                  </div>
                  <div className="panel-body" style={{ minHeight: "220px" }}>
                    <svg viewBox="0 0 600 170" style={{ width: "100%", height: "auto" }}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(107, 13, 35, 0.25)" />
                          <stop offset="100%" stopColor="rgba(107, 13, 35, 0)" />
                        </linearGradient>
                      </defs>
                      <line x1="40" y1="20" x2="40" y2="140" stroke="var(--border)" strokeWidth="0.5" />
                      <line x1="40" y1="140" x2="580" y2="140" stroke="var(--border)" strokeWidth="0.5" />
                      <line x1="40" y1="100" x2="580" y2="100" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4" />
                      <line x1="40" y1="60" x2="580" y2="60" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4" />
                      
                      <text x="30" y="143" fill="var(--text-dim)" fontSize="10" textAnchor="end" fontFamily="IBM Plex Mono">0</text>
                      <text x="30" y="103" fill="var(--text-dim)" fontSize="10" textAnchor="end" fontFamily="IBM Plex Mono">5</text>
                      <text x="30" y="63" fill="var(--text-dim)" fontSize="10" textAnchor="end" fontFamily="IBM Plex Mono">10</text>
                      
                      {/* Area */}
                      <path d="M40,120 L80,110 L120,90 L160,100 L200,70 L240,80 L280,50 L320,60 L360,30 L400,40 L440,20 L480,35 L520,15 L560,25 L560,140 L40,140Z" fill="url(#chartGrad)" />
                      {/* Line */}
                      <polyline className="chart-draw-line" points="40,120 80,110 120,90 160,100 200,70 240,80 280,50 320,60 360,30 400,40 440,20 480,35 520,15 560,25" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      
                      <circle cx="280" cy="50" r="4" fill="var(--purple)" stroke="var(--surface)" strokeWidth="2" />
                      <circle cx="440" cy="20" r="4" fill="var(--purple)" stroke="var(--surface)" strokeWidth="2" />
                      
                      <text x="40" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">W1</text>
                      <text x="160" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">W2</text>
                      <text x="280" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">W3</text>
                      <text x="400" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">W4</text>
                      <text x="520" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">W5</text>
                    </svg>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Severity Distribution</div>
                  </div>
                  <div className="panel-body">
                    <div className="donut-container">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--bg-alt)" strokeWidth="12" />
                        {/* Critical (Red) */}
                        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--red)" strokeWidth="12" strokeDasharray="50 250" strokeDashoffset="0" transform="rotate(-90 60 60)" />
                        {/* High (Amber) */}
                        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--amber)" strokeWidth="12" strokeDasharray="80 220" strokeDashoffset="-50" transform="rotate(-90 60 60)" />
                        {/* Medium (Purple/Gold) */}
                        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--purple)" strokeWidth="12" strokeDasharray="100 200" strokeDashoffset="-130" transform="rotate(-90 60 60)" />
                        {/* Total Count Text */}
                        <text x="60" y="56" textAnchor="middle" fill="var(--heading)" fontSize="20" fontWeight="800" fontFamily="IBM Plex Mono">46</text>
                        <text x="60" y="74" textAnchor="middle" fill="var(--text-dim)" fontSize="9" fontFamily="IBM Plex Mono">EVENTS</text>
                      </svg>
                      <div className="donut-legend">
                        <div className="legend-row"><div className="legend-dot" style={{ background: "var(--red)" }}></div>Critical<div className="legend-val">6</div></div>
                        <div className="legend-row"><div className="legend-dot" style={{ background: "var(--amber)" }}></div>High<div className="legend-val">12</div></div>
                        <div className="legend-row"><div className="legend-dot" style={{ background: "var(--purple)" }}></div>Medium<div className="legend-val">28</div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panels-grid panels-grid-equal">
                <div className="panel">
                  <div className="panel-header" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="panel-title">🔴 Real-Time Event Stream</div>
                      <span className="pulse" style={{ fontSize: "10px", color: "var(--red)", fontWeight: "bold" }}>● ACTIVE</span>
                    </div>
                    <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: "11px" }} onClick={handleAutoRefreshToggle}>
                      {autoRefresh ? "Pause Feed" : "Resume Feed"}
                    </button>
                  </div>
                  <div className="panel-body live-feed">
                    {liveFeed.map((item, idx) => (
                      <div className="feed-item" key={idx}>
                        <div className="feed-dot" style={{ background: item.type === "error" ? "var(--red)" : item.type === "warning" ? "var(--amber)" : "var(--accent)" }}></div>
                        <div className="feed-text">
                          {item.text} <span className="source">[{item.source}]</span>
                        </div>
                        <div className="feed-time">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Critical Vulnerable Targets</div>
                  </div>
                  <div className="panel-body" style={{ padding: "0px" }}>
                    <table className="data-table" style={{ width: "100%" }}>
                      <thead>
                        <tr>
                          <th>Hostname</th>
                          <th>OS Platform</th>
                          <th>Risk Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.slice(0, 4).map((a, idx) => (
                          <tr key={idx}>
                            <td><b>{a.hostname}</b><br/><span style={{ fontSize: "11px", color: "var(--text-dim)" }}>{a.ip}</span></td>
                            <td>{a.os}</td>
                            <td>
                              <span className={`badge ${a.riskScore > 75 ? "badge-critical" : "badge-high"}`}>
                                {a.riskScore}% Risk
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== 2. INCIDENTS KANBAN VIEW ===== */}
          {activeTab === "incidents" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", textAlign: "left" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Incident Management Board</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Drag, drop or move active security cases through triage statuses</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal("createIncident")}>+ New Incident</button>
              </div>

              <div className="kanban">
                {["Open", "Triaged", "In Progress", "Resolved"].map((status) => {
                  const filtered = incidents.filter((i) => i.status === status);
                  return (
                    <div className="kanban-col" key={status}>
                      <div className="kanban-col-header">
                        <span className="kanban-col-title">{status}</span>
                        <span className="kanban-col-count">{filtered.length}</span>
                      </div>
                      <div className="kanban-cards">
                        {filtered.map((inc) => (
                          <div className="k-card" key={inc.id}>
                            <div className="k-card-id">{inc.id}</div>
                            <div className="k-card-title">{inc.title}</div>
                            <div className="k-card-meta">
                              <div className="user-avatar k-card-assignee" style={{ background: inc.assigneeColor }}>
                                {inc.assignee}
                              </div>
                              <span className={`badge ${inc.severity === "P1" ? "badge-critical" : "badge-high"}`}>
                                {inc.severity}
                              </span>
                              <span className="k-card-sla">{inc.sla}</span>
                            </div>
                            
                            <div className="k-card-actions">
                              {status !== "Open" && (
                                <button className="k-card-action-btn" onClick={() => moveIncident(inc.id, status === "Triaged" ? "Open" : status === "In Progress" ? "Triaged" : "In Progress")}>
                                  ◀ Move
                                </button>
                              )}
                              {status !== "Resolved" && (
                                <button className="k-card-action-btn" onClick={() => moveIncident(inc.id, status === "Open" ? "Triaged" : status === "Triaged" ? "In Progress" : "Resolved")}>
                                  Move ▶
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== 3. ALERTS VIEW ===== */}
          {activeTab === "alerts" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", textAlign: "left" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Detection Engine Alerts</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Active triggers from SIEM analyzers</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-ghost" onClick={() => { if(checkWritePermission()) { setAlerts(alerts.map(a => ({ ...a, status: "Triaged" }))); showToast("success", "All alerts acknowledged."); addAuditLog("Mass acknowledged all open alerts."); } }}>Acknowledge All</button>
                  <button className="btn btn-primary" onClick={() => openModal("createRule")}>+ Detection Rule</button>
                </div>
              </div>

              <div className="panel">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Alert ID</th>
                        <th>Alert Description</th>
                        <th>Severity</th>
                        <th>Log Source</th>
                        <th>Occurrences</th>
                        <th>First Logged</th>
                        <th>Triage Status</th>
                        <th>Operation Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((al) => (
                        <tr key={al.id}>
                          <td><b>{al.id}</b></td>
                          <td>{al.name}</td>
                          <td>
                            <span className={`badge ${al.severity === "CRITICAL" ? "badge-critical" : al.severity === "HIGH" ? "badge-high" : "badge-medium"}`}>
                              {al.severity}
                            </span>
                          </td>
                          <td><code style={{ fontSize: "11px" }}>{al.source}</code></td>
                          <td style={{ fontFamily: "IBM Plex Mono", fontWeight: "bold" }}>{al.count}</td>
                          <td>{al.firstSeen}</td>
                          <td>
                            <span className={`badge ${al.status === "Open" ? "badge-critical" : al.status === "Triaged" ? "badge-high" : "badge-low"}`}>
                              {al.status}
                            </span>
                          </td>
                          <td>
                            {al.status === "Open" && (
                              <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "11px", marginRight: "4px" }} onClick={() => acknowledgeAlert(al.id)}>
                                Acknowledge
                              </button>
                            )}
                            {al.status !== "Resolved" && (
                              <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "11px", background: "var(--green)", borderColor: "var(--green)" }} onClick={() => resolveAlert(al.id)}>
                                Resolve
                              </button>
                            )}
                            {al.status === "Resolved" && <span style={{ color: "var(--text-dim)", fontSize: "11px" }}>Closed</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== 4. THREAT INTEL VIEW ===== */}
          {activeTab === "threats" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", textAlign: "left" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Threat Intelligence Feed</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Library of indicators of compromise (IOCs) registered on watchlists</p>
                </div>
                <button className="btn btn-primary" onClick={() => { showToast("success", "Threat feed synced: 3 new watchlist hashes added."); addAuditLog("Synchronized global threat feeds."); }}>
                  Sync Global Feed
                </button>
              </div>

              <div className="ioc-grid">
                {threats.map((t, idx) => (
                  <div className="ioc-card" key={idx}>
                    <div className="ioc-type">{t.type}</div>
                    <div className="ioc-value">{t.value}</div>
                    <div className="ioc-meta">
                      <span className={`badge ${t.severity === "CRITICAL" ? "badge-critical" : "badge-high"}`}>
                        {t.severity} Severity
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-dim)", marginLeft: "auto" }}>
                        Logged: {t.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== 5. VULNERABILITIES VIEW ===== */}
          {activeTab === "vulnerabilities" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", textAlign: "left" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Vulnerability Scanner</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>CVSS host based vulnerabilities and scans</p>
                </div>
                <button className="btn btn-primary" onClick={runScan} disabled={isScanning}>
                  {isScanning ? "Scanning Hosts..." : "▶ Run Vulnerability Scan"}
                </button>
              </div>

              <div className="panel" style={{ marginBottom: "20px", textAlign: "left" }}>
                <div className="panel-header">
                  <div className="panel-title">Asset Vulnerability Matrix (Heatmap)</div>
                </div>
                <div className="panel-body">
                  <div className="vuln-heatmap">
                    {heatmapCells.map((cell) => (
                      <div 
                        className={`heat-cell ${cell.class}`} 
                        key={cell.id}
                        onClick={() => showToast("info", `${cell.label} CVSS Vulnerability Rating is: ${cell.score}`)}
                        title={`${cell.label}: CVSS ${cell.score}`}
                        style={{
                          background: cell.class === "critical" ? "var(--red-dim)" : cell.class === "high" ? "var(--amber-dim)" : "var(--purple-dim)",
                          color: cell.class === "critical" ? "var(--red)" : cell.class === "high" ? "var(--amber)" : "var(--purple)",
                          border: `1px solid ${cell.class === "critical" ? "var(--red)" : cell.class === "high" ? "var(--amber)" : "var(--purple)"}`
                        }}
                      >
                        {cell.score}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    * Click on any CVSS cell block to display catalog references.
                  </p>
                </div>
              </div>

              <div className="panel">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>CVE Identifier</th>
                        <th>CVSS Rating</th>
                        <th>Severity</th>
                        <th>Affected Host</th>
                        <th>Vulnerability Reference Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><b>CVE-2026-01</b></td>
                        <td style={{ fontFamily: "IBM Plex Mono", fontWeight: "bold" }}>9.8</td>
                        <td><span className="badge badge-critical">CRITICAL</span></td>
                        <td>PROD-DB-01</td>
                        <td>Remote Code Execution in Database Parser Engine</td>
                      </tr>
                      <tr>
                        <td><b>CVE-2025-44</b></td>
                        <td style={{ fontFamily: "IBM Plex Mono", fontWeight: "bold" }}>8.5</td>
                        <td><span className="badge badge-high">HIGH</span></td>
                        <td>CORP-DC-01</td>
                        <td>Privilege Escalation bypass in Active Directory</td>
                      </tr>
                      <tr>
                        <td><b>CVE-2025-18</b></td>
                        <td style={{ fontFamily: "IBM Plex Mono", fontWeight: "bold" }}>5.4</td>
                        <td><span className="badge badge-medium">MEDIUM</span></td>
                        <td>STG-WEB-02</td>
                        <td>Cross Site Scripting in landing page form fields</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== 6. ASSETS VIEW ===== */}
          {activeTab === "assets" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", textAlign: "left" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>System Asset Inventory</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>monitored servers and directory hosts</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal("addAsset")}>+ Add Asset</button>
              </div>

              <div className="panel">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hostname</th>
                        <th>IP Address</th>
                        <th>OS Platform</th>
                        <th>Criticality</th>
                        <th>Team Owner</th>
                        <th>Asset Risk</th>
                        <th>Compliance State</th>
                        <th>Last Ping</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((as, idx) => (
                        <tr key={idx}>
                          <td><b>{as.hostname}</b></td>
                          <td><code style={{ fontSize: "11px" }}>{as.ip}</code></td>
                          <td>{as.os}</td>
                          <td>{as.criticality}</td>
                          <td>{as.owner}</td>
                          <td>
                            <span className={`badge ${as.riskScore > 75 ? "badge-critical" : as.riskScore > 50 ? "badge-high" : "badge-low"}`}>
                              {as.riskScore}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${as.status === "Patched" ? "badge-green" : "badge-amber"}`}>
                              {as.status}
                            </span>
                          </td>
                          <td>{as.lastSeen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== 7. LOG EXPLORER VIEW ===== */}
          {activeTab === "logs" && (
            <div>
              <div style={{ textAlign: "left", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>SIEM Log Explorer</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Query parsed system event logs</p>
                
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <div className="search-box" style={{ flex: 1, minWidth: "280px" }}>
                    <span>🔍</span>
                    <input 
                      type="text" 
                      placeholder="Query messages... (e.g. 'failed login')" 
                      value={logSearch} 
                      onChange={(e) => setLogSearch(e.target.value)} 
                    />
                  </div>
                  <select className="form-select" style={{ width: "auto" }} value={logSeverity} onChange={(e) => setLogSeverity(e.target.value)}>
                    <option value="">All Severities</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="ERROR">ERROR</option>
                    <option value="WARNING">WARNING</option>
                    <option value="INFO">INFO</option>
                  </select>
                  <select className="form-select" style={{ width: "auto" }} value={logSource} onChange={(e) => setLogSource(e.target.value)}>
                    <option value="">All Sources</option>
                    <option value="firewall">Firewall</option>
                    <option value="auth">Auth Service</option>
                    <option value="ids">IDS</option>
                    <option value="endpoint">Endpoint</option>
                  </select>
                </div>
              </div>

              <div className="panel">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Source</th>
                        <th>Event Log Message</th>
                        <th>Host IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: "IBM Plex Mono", fontSize: "11px" }}>{log.timestamp}</td>
                          <td>
                            <span className={`badge ${log.level === "CRITICAL" ? "badge-critical" : log.level === "ERROR" ? "badge-high" : log.level === "WARNING" ? "badge-high" : "badge-info"}`}>
                              {log.level}
                            </span>
                          </td>
                          <td><code style={{ fontSize: "11px" }}>{log.source}</code></td>
                          <td style={{ textAlign: "left", whiteSpace: "normal" }}>{log.message}</td>
                          <td><code style={{ fontSize: "11px" }}>{log.ip}</code></td>
                        </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", color: "var(--text-dim)" }}>
                            No log events match current query parameters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== 8. PLAYBOOKS VIEW ===== */}
          {activeTab === "playbooks" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", textAlign: "left" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Incident Response Playbooks</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>SOAR response scripts</p>
                </div>
                <button className="btn btn-primary" onClick={() => showToast("info", "Playbook builder is a premium add-on module.")}>
                  + New Playbook
                </button>
              </div>

              <div className="panel" style={{ marginBottom: "16px" }}>
                <div className="panel-header"><div className="panel-title">Ransomware Containment Flow</div></div>
                <div className="panel-body">
                  <div className="playbook-flow">
                    <div className="pb-step"><div className="pb-step-num">Step 1</div><div className="pb-step-name">Ingest Alert</div><div className="pb-step-type">Automated</div></div>
                    <div className="pb-arrow">➔</div>
                    <div className="pb-step" style={{ background: "var(--accent-dim)", borderColor: "var(--accent)" }}><div className="pb-step-num">Step 2</div><div className="pb-step-name">Isolate Host</div><div className="pb-step-type">EDR Action</div></div>
                    <div className="pb-arrow">➔</div>
                    <div className="pb-step"><div className="pb-step-num">Step 3</div><div className="pb-step-name">Revoke Access</div><div className="pb-step-type">IAM Script</div></div>
                    <div className="pb-arrow">➔</div>
                    <div className="pb-step"><div className="pb-step-num">Step 4</div><div className="pb-step-name">Triage Team Alert</div><div className="pb-step-type">Notification</div></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== 9. COMPLIANCE VIEW ===== */}
          {activeTab === "compliance" && (
            <div>
              <div style={{ textAlign: "left", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Compliance Matrix</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Track organizational posture against cyber controls</p>
              </div>

              <div className="compliance-framework">
                <div className="framework-header">
                  <div className="framework-name">SOC 2 Type II Compliance</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: "82%" }}></div></div>
                  <div className="framework-score">82%</div>
                </div>
                <div className="control-grid">
                  <div className="control-item"><div className="control-status" style={{ background: "var(--green)" }}></div><div><span className="control-id">CC6.1</span> Access Control</div></div>
                  <div className="control-item"><div className="control-status" style={{ background: "var(--green)" }}></div><div><span className="control-id">CC6.3</span> Encryption keys</div></div>
                  <div className="control-item"><div className="control-status" style={{ background: "var(--red)" }}></div><div><span className="control-id">CC6.5</span> Two-Factor Auth</div></div>
                </div>
              </div>

              <div className="compliance-framework">
                <div className="framework-header">
                  <div className="framework-name">ISO 27001 posture</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: "74%" }}></div></div>
                  <div className="framework-score">74%</div>
                </div>
              </div>
            </div>
          )}

          {/* ===== 10. REPORTS VIEW ===== */}
          {activeTab === "reports" && (
            <div>
              <div style={{ textAlign: "left", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Security Reports</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Generate printable compliance and audit summaries</p>
              </div>

              <div className="ioc-grid">
                <div className="ioc-card">
                  <div className="ioc-value">SOC2 Posture Audit</div>
                  <div className="ioc-type">Compliance Report</div>
                  <button className="btn btn-primary" style={{ marginTop: "10px" }} onClick={() => showToast("success", "Exporting SOC2 report in PDF...")}>
                    Download PDF
                  </button>
                </div>
                <div className="ioc-card">
                  <div className="ioc-value">Incident Logs (Last 24 Hours)</div>
                  <div className="ioc-type">Operations summary</div>
                  <button className="btn btn-primary" style={{ marginTop: "10px" }} onClick={() => showToast("success", "CSV file generated.")}>
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== 11. AUDIT TRAIL VIEW ===== */}
          {activeTab === "audit" && (
            <div>
              <div style={{ textAlign: "left", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>SOC Audit Trail</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Immutable logs of security analyst administrative operations</p>
              </div>

              <div className="panel">
                <div className="panel-body">
                  {auditLogs.map((log, idx) => (
                    <div className="audit-entry" key={idx}>
                      <span className="audit-time">{log.timestamp}</span>
                      <span className="audit-user">@{log.user}</span>
                      <span className="audit-action">{log.action}</span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p style={{ color: "var(--text-dim)", fontSize: "12px", textAlign: "center" }}>
                      No audit events recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

         {/* ===== 12. KNOWLEDGE BASE VIEW ===== */}
{activeTab === "knowledge" && (
  <>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "250px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <option value="All">All Categories</option>
          <option value="Email Security">Email Security</option>
          <option value="Web Security">Web Security</option>
          <option value="Malware">Malware</option>
          <option value="Network Security">Network Security</option>
          <option value="Cloud Security">Cloud Security</option>
        </select>
      </div>

      <button
  onClick={() => setShowAddArticle(true)}
  style={{
    background: "#7B3F00",
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
  }}
>
  ➕ Add Article
</button>
    </div>

    <div className="kb-grid">
      {knowledgeArticles.length === 0 ? (
        <p>No Knowledge Base articles found.</p>
      ) : (
        knowledgeArticles
          .filter((article) => {
            const matchesSearch =
              article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
              article.author.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory =
              selectedCategory === "All" ||
              article.category === selectedCategory;

            return matchesSearch && matchesCategory;
          })
          .map((article) => (
            <div className="kb-card" key={article.id}>

    <h3> {article.title}</h3>

    <div className="kb-label">Category</div>
    <div className="kb-value">{article.category}</div>

    <div className="kb-label">Content</div>
    <div className="kb-content">
        {article.content}
    </div>

    <div className="kb-footer">
        <span><b>Author:</b> {article.author}</span>
        <span>{article.createdAt}</span>
    </div>

    <hr className="kb-divider"/>

    <div className="kb-actions">

        <button
  onClick={() => editArticle(article)}
  style={{
    background: "#7B3F00",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  }}
>
    ✏ Edit
</button>

        <button
  onClick={() => deleteArticle(article.id)}
  style={{
    background: "#7B3F00",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  }}
>
   🗑 Delete
</button>
    </div>

</div>
          ))
      )}
    </div>
  </>
)}

{/* ===== ADD ARTICLE POPUP ===== */}
{showAddArticle && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "10px",
        width: "500px",
      }}
    >
      <h2>Add Knowledge Base Article</h2>

      <input
        type="text"
        placeholder="Title"
        value={newArticle.title}
        onChange={(e) =>
          setNewArticle({ ...newArticle, title: e.target.value })
        }
        style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
      />

      <input
        type="text"
        placeholder="Category"
        value={newArticle.category}
        onChange={(e) =>
          setNewArticle({ ...newArticle, category: e.target.value })
        }
        style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
      />

      <textarea
        rows="5"
        placeholder="Content"
        value={newArticle.content}
        onChange={(e) =>
          setNewArticle({ ...newArticle, content: e.target.value })
        }
        style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
      />

      <input
        type="text"
        placeholder="Author"
        value={newArticle.author}
        onChange={(e) =>
          setNewArticle({ ...newArticle, author: e.target.value })
        }
        style={{ width: "100%", marginBottom: "15px", padding: "10px" }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setShowAddArticle(false)}
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          Cancel
        </button>

        <button
          onClick={saveArticle}
          style={{
            padding: "10px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          💾 Save Article
        </button>
      </div>
    </div>
  </div>
)}

{showEditArticle && editingArticle && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "10px",
        width: "500px",
      }}
    >
      <h2>Edit Knowledge Base Article</h2>

      <input
        type="text"
        value={editingArticle.title}
        onChange={(e) =>
          setEditingArticle({
            ...editingArticle,
            title: e.target.value,
          })
        }
        style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
      />

      <input
        type="text"
        value={editingArticle.category}
        onChange={(e) =>
          setEditingArticle({
            ...editingArticle,
            category: e.target.value,
          })
        }
        style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
      />

      <textarea
        rows="5"
        value={editingArticle.content}
        onChange={(e) =>
          setEditingArticle({
            ...editingArticle,
            content: e.target.value,
          })
        }
        style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
      />

      <input
        type="text"
        value={editingArticle.author}
        onChange={(e) =>
          setEditingArticle({
            ...editingArticle,
            author: e.target.value,
          })
        }
        style={{ width: "100%", marginBottom: "15px", padding: "10px" }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        <button onClick={() => setShowEditArticle(false)}>
          Cancel
        </button>

        <button onClick={updateArticle}>
          Update
        </button>
      </div>
    </div>
  </div>
)}
          {/* ===== 13. USERS & TEAMS VIEW (ADMIN ONLY) ===== */}
          {activeTab === "users" && role === "ADMIN" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", textAlign: "left" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Users & Teams</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Manage enterprise SOC analysts and permissions</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal("addUser")}>+ Invite User</button>
              </div>

              <div className="panel">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email Address</th>
                        <th>Role Privileges</th>
                        <th>Department Team</th>
                        <th>Status</th>
                        <th>Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((usr, idx) => (
                        <tr key={idx}>
                          <td><b>{usr.name}</b></td>
                          <td>{usr.email}</td>
                          <td>
                            <span className={`badge ${usr.role === "ADMIN" ? "badge-critical" : usr.role === "ANALYST" ? "badge-high" : "badge-info"}`}>
                              {usr.role}
                            </span>
                          </td>
                          <td>{usr.team}</td>
                          <td>
                            <span className="badge badge-low" style={{ background: usr.status === "Away" ? "var(--amber-dim)" : "var(--green-dim)", color: usr.status === "Away" ? "var(--amber)" : "var(--green)" }}>
                              {usr.status}
                            </span>
                          </td>
                          <td>{usr.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== 14. SETTINGS VIEW (ADMIN ONLY) ===== */}
          {activeTab === "settings" && role === "ADMIN" && (
            <div style={{ textAlign: "left" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Settings & Configuration</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Configure enterprise security parameters and session policies</p>
              </div>

              <div className="settings-section">
                <div className="settings-title">Access & Authentication</div>
                <div className="setting-row">
                  <div>
                    <div className="setting-label">Enable Multi-Factor Authentication (MFA)</div>
                    <div className="setting-desc">Require simulated 6-digit OTP code verification for all logins.</div>
                  </div>
                  <button className={`toggle ${mfaEnabled ? "on" : ""}`} onClick={handleMfaToggle}></button>
                </div>
              </div>

              <div className="settings-section">
                <div className="settings-title">Live Monitoring Stream</div>
                <div className="setting-row">
                  <div>
                    <div className="setting-label">Auto-Refresh Live Event Feed</div>
                    <div className="setting-desc">Simulate live-updating logs on the central dashboard feed.</div>
                  </div>
                  <button className={`toggle ${autoRefresh ? "on" : ""}`} onClick={handleAutoRefreshToggle}></button>
                </div>
                <div className="setting-row">
                  <div>
                    <div className="setting-label">Refresh Interval (Seconds)</div>
                    <div className="setting-desc">Seconds between simulated background events.</div>
                  </div>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ width: "80px", textAlign: "center" }}
                    value={refreshRate} 
                    onChange={(e) => { 
                      const val = Math.max(1, +e.target.value); 
                      setRefreshRate(val); 
                      addAuditLog(`Updated dashboard live feed interval to ${val}s`); 
                    }} 
                  />
                </div>
              </div>

              <div className="settings-section">
                <div className="settings-title">Active Security Sessions</div>
                <div className="panel">
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Device / Browser</th>
                          <th>Access IP</th>
                          <th>Login Timestamp</th>
                          <th>Action Trigger</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((sess) => (
                          <tr key={sess.id}>
                            <td>
                              <b>{sess.device}</b>{" "}
                              {sess.isCurrent && (
                                <span className="badge badge-low" style={{ fontSize: "9px", padding: "1px 4px" }}>
                                  Current Session
                                </span>
                              )}
                            </td>
                            <td><code style={{ fontSize: "11px" }}>{sess.ip}</code></td>
                            <td>{sess.loginTime}</td>
                            <td>
                              {!sess.isCurrent ? (
                                <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "11px", color: "var(--red)" }} onClick={() => terminateSession(sess.id)}>
                                  Revoke Session
                                </button>
                              ) : (
                                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Protected</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== TOAST NOTIFICATION CONTAINER ===== */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div className={`toast ${toast.type}`} key={toast.id}>
            <div className="toast-icon">
              {toast.type === "success" ? "✅" : toast.type === "warning" ? "⚠️" : "ℹ️"}
            </div>
            <div className="toast-msg">{toast.message}</div>
            <button className="toast-close" onClick={() => setToasts(toasts.filter((t) => t.id !== toast.id))}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* ===== EDIT DIALOG MODALS ===== */}
      {modalType && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            {modalType === "createIncident" && (
              <>
                <div className="modal-header">
                  <h3>Register New Security Incident</h3>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Incident Threat Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Host compromised via lateral port scan" 
                      value={newIncident.title} 
                      onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Critical Priority SLA</label>
                    <select 
                      className="form-select" 
                      value={newIncident.severity} 
                      onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                    >
                      <option value="P1">P1 - Critical Priority (SLA: 1h)</option>
                      <option value="P2">P2 - High Priority (SLA: 4h)</option>
                      <option value="P3">P3 - Medium Priority (SLA: 12h)</option>
                      <option value="P4">P4 - Low Priority (SLA: 24h)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Analyst Initials</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      maxLength="3" 
                      placeholder="e.g. MK" 
                      value={newIncident.assignee} 
                      onChange={(e) => setNewIncident({ ...newIncident, assignee: e.target.value.toUpperCase() })} 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleCreateIncident}>Register Case</button>
                </div>
              </>
            )}

            {modalType === "addAsset" && (
              <>
                <div className="modal-header">
                  <h3>Register System Host Asset</h3>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">System Hostname</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. PROD-AUTH-02" 
                      value={newAsset.hostname} 
                      onChange={(e) => setNewAsset({ ...newAsset, hostname: e.target.value.toUpperCase() })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IP Address Mapping</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 10.0.3.12" 
                      value={newAsset.ip} 
                      onChange={(e) => setNewAsset({ ...newAsset, ip: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operating System Platform</label>
                    <select 
                      className="form-select" 
                      value={newAsset.os} 
                      onChange={(e) => setNewAsset({ ...newAsset, os: e.target.value })}
                    >
                      <option value="Linux Ubuntu">Linux Ubuntu</option>
                      <option value="Linux Debian">Linux Debian</option>
                      <option value="Windows Server 2022">Windows Server 2022</option>
                      <option value="macOS Sequoia">macOS Sequoia</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Criticality Classification</label>
                    <select 
                      className="form-select" 
                      value={newAsset.criticality} 
                      onChange={(e) => setNewAsset({ ...newAsset, criticality: e.target.value })}
                    >
                      <option value="Critical">Critical Business Node</option>
                      <option value="High">High Priority Host</option>
                      <option value="Medium">Medium Internal Host</option>
                      <option value="Low">Low Audit Sandbox</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team Owner Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. NetOps Team" 
                      value={newAsset.owner} 
                      onChange={(e) => setNewAsset({ ...newAsset, owner: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleAddAsset}>Register Asset</button>
                </div>
              </>
            )}

            {modalType === "addUser" && (
              <>
                <div className="modal-header">
                  <h3>Invite Team Member</h3>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Varsha Raj" 
                      value={newUser.name} 
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="e.g. varsha.r@sentinelcore.io" 
                      value={newUser.email} 
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Access Privileges Role</label>
                    <select 
                      className="form-select" 
                      value={newUser.role} 
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="ADMIN">ADMIN (Full access control & settings)</option>
                      <option value="ANALYST">ANALYST (Triage & response logs)</option>
                      <option value="VIEWER">VIEWER (Read-only guest session)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team Department</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Incident Handler Group" 
                      value={newUser.team} 
                      onChange={(e) => setNewUser({ ...newUser, team: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleAddUser}>Invite User</button>
                </div>
              </>
            )}

            {modalType === "createRule" && (
              <>
                <div className="modal-header">
                  <h3>Deploy Custom Detection Rule</h3>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Detection Rule Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Suspicious directory traversals" 
                      value={newRule.name} 
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Severity Level</label>
                    <select 
                      className="form-select" 
                      value={newRule.severity} 
                      onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Log Source</label>
                    <select 
                      className="form-select" 
                      value={newRule.source} 
                      onChange={(e) => setNewRule({ ...newRule, source: e.target.value })}
                    >
                      <option value="firewall">Firewall logs</option>
                      <option value="auth">Authentication logs</option>
                      <option value="ids">IDS alert logs</option>
                      <option value="endpoint">EDR Endpoint logs</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alert Message Regular Expression</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. GET .*%2e%2e%2f.*" 
                      value={newRule.msgMatch} 
                      onChange={(e) => setNewRule({ ...newRule, msgMatch: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleCreateRule}>Deploy Rule</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;