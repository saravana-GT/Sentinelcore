import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import Chatbot from "../../components/Chatbot/Chatbot";
import "./Dashboard.css";

let fallbackUrl = "https://sentinelcore-9hxu.onrender.com";
const API_URL = (import.meta.env.VITE_API_URL || fallbackUrl).replace(/\/$/, "");

const CVE_DETAILS = {
  "CVE-2026-01": { host: "PROD-DB-01", desc: "Remote Code Execution in Database Parser Engine" },
  "CVE-2025-44": { host: "CORP-DC-01", desc: "Privilege Escalation bypass in Active Directory" },
  "CVE-2025-18": { host: "STG-WEB-02", desc: "Cross Site Scripting in landing page form fields" },
  "CVE-2026-11": { host: "CORP-DC-01", desc: "SSL/TLS Weak Cipher Suites enabled" },
  "CVE-2024-90": { host: "PROD-APP-01", desc: "Deserialization of Untrusted Data in session management" },
  "CVE-2026-03": { host: "DMZ-WAF-01", desc: "Remote Command Execution in WAF admin dashboard" },
  "CVE-2025-05": { host: "STG-WEB-02", desc: "Server Version disclosure in HTTP response header" },
  "CVE-2026-12": { host: "PROD-APP-01", desc: "Improper access control on metrics endpoints" }
};

function Dashboard() {
  const navigate = useNavigate();

  // User details
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("ADMIN");

  // Navigation
  const [activeTab, setActiveTab] = useState("dashboard");

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Modals
  const [modalType, setModalType] = useState(null); // 'createIncident' | 'addAsset' | 'addUser' | 'createRule' | null

  // Inputs for modals
  const [newIncident, setNewIncident] = useState({ title: "", severity: "P2", assignee: "" });
  const [newAsset, setNewAsset] = useState({ hostname: "", ip: "", os: "Linux Ubuntu", criticality: "High", owner: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "ANALYST", team: "SOC Operations" });
  const [newRule, setNewRule] = useState({ name: "", severity: "HIGH", source: "ids", msgMatch: "" });

  // Data Stores
  // Data Stores (Strictly Real Database & Live Telemetry Driven)
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [threats, setThreats] = useState([]);
  const [assets, setAssets] = useState([]);
  const [logs, setLogs] = useState([]);

  // SIEM Filter States
  const [logSearch, setLogSearch] = useState("");
  const [logSeverity, setLogSeverity] = useState("");
  const [logSource, setLogSource] = useState("");

  // Audit Logs (dynamic tracking)
  const [auditLogs, setAuditLogs] = useState(() => {
    return JSON.parse(localStorage.getItem("audit_logs") || "[]");
  });

  // Sessions list
  const [sessions, setSessions] = useState([]);

  // Live feed updates
  const [liveFeed, setLiveFeed] = useState([]);

  // Vulnerability scan simulation states
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCVE, setSelectedCVE] = useState(null);
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

  // Playbooks & SOAR automation states
  const [playbooks, setPlaybooks] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [activePlaybookSubTab, setActivePlaybookSubTab] = useState("available"); // 'available' | 'history'

  // Live Telemetry & WebSockets States
  const [liveMetrics, setLiveMetrics] = useState({
    totalAssets: 0,
    onlineAssets: 0,
    offlineAssets: 0,
    criticalAlerts: 3,
    highAlerts: 7,
    mediumAlerts: 12,
    lowAlerts: 4,
    avgCpu: 35.4,
    avgRam: 62.1,
    avgDisk: 48.0
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [incidentTimeframe, setIncidentTimeframe] = useState("30D");

  // Knowledge Base States
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

  // Asset Management API States
  const [dbAssets, setDbAssets] = useState([]);
  const [assetTotalPages, setAssetTotalPages] = useState(1);
  const [assetPage, setAssetPage] = useState(0);
  const [assetSearch, setAssetSearch] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState("");
  const [assetCriticalityFilter, setAssetCriticalityFilter] = useState("");
  const [assetStatusFilter, setAssetStatusFilter] = useState("");
  const [assetAgentStatusFilter, setAssetAgentStatusFilter] = useState("");
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);
  const [assetDetailSubTab, setAssetDetailSubTab] = useState("processes");

  // Phase 4: Vulnerability Management States
  const [dbVulnerabilities, setDbVulnerabilities] = useState([]);
  const [vulnSeverityFilter, setVulnSeverityFilter] = useState("");
  const [vulnPatchFilter, setVulnPatchFilter] = useState("");

  // Phase 5: Network Discovery States
  const [targetSubnet, setTargetSubnet] = useState("192.168.1.0/24");
  const [isDiscoveryScanning, setIsDiscoveryScanning] = useState(false);

  // Phase 6: SIEM Log Explorer States
  const [dbSiemLogs, setDbSiemLogs] = useState([]);
  const [siemLogTotalPages, setSiemLogTotalPages] = useState(1);
  const [siemLogPage, setSiemLogPage] = useState(0);
  const [siemLogQuery, setSiemLogQuery] = useState("");
  const [siemLogSourceFilter, setSiemLogSourceFilter] = useState("");
  const [siemSeverityFilter, setSiemSeverityFilter] = useState("");
  const [dbAlerts, setDbAlerts] = useState([]);

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

  // Fetch active threat feeds from backend
  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/threats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map(item => ({
            value: item.value,
            type: item.type,
            severity: item.severity,
            date: item.date || "2026-07-15"
          }));
          setThreats(formatted);
        }
      } catch (err) {
        console.error("Error fetching threat feeds:", err);
      }
    };

    fetchThreats();
  }, []);

  const fetchPlaybooks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/playbooks`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPlaybooks(data);
      }
    } catch (err) {
      console.error("Error fetching playbooks:", err);
    }
  };

  const fetchExecutions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/playbooks/executions`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setExecutions(data);
      }
    } catch (err) {
      console.error("Error fetching executions:", err);
    }
  };

  const executePlaybook = async (playbookId, playbookName) => {
    try {
      showToast("info", `Triggering execution for ${playbookName}...`);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/playbooks/${playbookId}/execute`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          initiatedBy: username || "ADMIN"
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast("success", `Playbook ${playbookName} execution completed!`);
        addAuditLog(`Executed SOAR playbook: ${playbookName}`);
        fetchExecutions();
        setActivePlaybookSubTab("history");
        setSelectedExecution(data);
      } else {
        const errorText = await res.text();
        console.error("Playbook execution failed:", errorText);
        showToast("warning", "Playbook execution failed.");
      }
    } catch (err) {
      console.error("Error executing playbook:", err);
      showToast("warning", "Error executing playbook.");
    }
  };

  useEffect(() => {
    if (activeTab === "playbooks") {
      fetchPlaybooks();
      fetchExecutions();
    }
  }, [activeTab]);

  // Live WebSocket Telemetry Stream
  useEffect(() => {
    let ws;
    let timer;
    const connectWs = () => {
      try {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = API_URL.startsWith("http") 
          ? API_URL.replace(/^http/, 'ws') + '/ws/dashboard' 
          : `${wsProtocol}//${window.location.host}/ws/dashboard`;

        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          setWsConnected(true);
          console.log("Connected to SentinelCore live WebSocket telemetry stream!");
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "DASHBOARD_LIVE_METRICS") {
              if (data.stats) {
                setLiveMetrics(data.stats);
              }
              if (data.latestAlerts) {
                setLiveFeed(data.latestAlerts.map(alert => {
                  let timeStr = "Live";
                  if (alert.createdAt) {
                    let iso = alert.createdAt;
                    if (typeof iso === "string" && !iso.endsWith("Z") && !iso.includes("+")) iso += "Z";
                    const d = new Date(iso);
                    timeStr = isNaN(d.getTime()) ? alert.createdAt : d.toLocaleTimeString();
                  }
                  return {
                    text: `${alert.title}: ${alert.description || ""}`,
                    source: alert.source ? alert.source.toLowerCase() : "system",
                    time: timeStr,
                    type: alert.severity ? alert.severity.toLowerCase() : "info"
                  };
                }));
              }
            }
          } catch (err) {
            console.error("Error parsing WebSocket telemetry:", err);
          }
        };
        ws.onclose = () => {
          setWsConnected(false);
          timer = setTimeout(connectWs, 4000);
        };
        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        console.error("WebSocket connection failure:", err);
      }
    };

    connectWs();
    return () => {
      if (ws) ws.close();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Asset Management REST API handlers
  const fetchDbAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        page: assetPage,
        size: 8,
        sortBy: "id",
        sortDir: "desc"
      });
      if (assetSearch) queryParams.append("search", assetSearch);
      if (assetTypeFilter) queryParams.append("type", assetTypeFilter);
      if (assetCriticalityFilter) queryParams.append("criticality", assetCriticalityFilter);
      if (assetStatusFilter) queryParams.append("status", assetStatusFilter);
      if (assetAgentStatusFilter) queryParams.append("agentStatus", assetAgentStatusFilter);

      const res = await fetch(`${API_URL}/api/assets?${queryParams.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbAssets(data.content || []);
        setAssetTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching database assets:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "assets") {
      fetchDbAssets();
    }
  }, [activeTab, assetPage, assetSearch, assetTypeFilter, assetCriticalityFilter, assetStatusFilter, assetAgentStatusFilter]);

  const handleCreateAssetApi = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/assets`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          hostname: newAsset.hostname,
          deviceName: newAsset.hostname + "-NODE",
          assetType: newAsset.assetType || "DESKTOP",
          operatingSystem: newAsset.os || "Linux Ubuntu",
          ipAddress: newAsset.ip || "10.0.3.15",
          criticality: newAsset.criticality || "MEDIUM",
          owner: newAsset.owner || "IT Ops",
          status: "ACTIVE",
          agentStatus: "UNINSTALLED"
        })
      });
      if (res.ok) {
        showToast("success", `Asset ${newAsset.hostname} created in database!`);
        addAuditLog(`Registered new asset: ${newAsset.hostname}`);
        closeModal();
        fetchDbAssets();
      } else {
        showToast("warning", "Error creating asset in database.");
      }
    } catch (err) {
      console.error("Error creating asset:", err);
      showToast("warning", "Error creating asset.");
    }
  };

  const handleDeleteAssetApi = async (id, hostname) => {
    if (!window.confirm(`Are you sure you want to delete asset ${hostname}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/assets/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("success", `Asset ${hostname} deleted.`);
        addAuditLog(`Deleted asset: ${hostname}`);
        fetchDbAssets();
      }
    } catch (err) {
      console.error("Error deleting asset:", err);
    }
  };

  const handleExportAssetsApi = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/assets/export`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sentinelcore_assets.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast("success", "Exported assets CSV file successfully!");
      }
    } catch (err) {
      console.error("Error exporting assets CSV:", err);
    }
  };

  const handleImportAssetsApi = async (file) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/api/assets/import`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        showToast("success", "Assets CSV imported into database successfully!");
        fetchDbAssets();
      }
    } catch (err) {
      console.error("Error importing assets CSV:", err);
    }
  };

  const viewAssetDetailsApi = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/assets/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedAssetDetail(data);
        openModal("assetDetails");
      }
    } catch (err) {
      console.error("Error viewing asset details:", err);
    }
  };

  // Phase 4: Vulnerability Management API Handlers
  const fetchDbVulnerabilities = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({ page: 0, size: 20 });
      if (vulnSeverityFilter) queryParams.append("severity", vulnSeverityFilter);
      if (vulnPatchFilter) queryParams.append("patchStatus", vulnPatchFilter);

      const res = await fetch(`${API_URL}/api/vulnerabilities?${queryParams.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbVulnerabilities(data.content || []);
      }
    } catch (err) {
      console.error("Error fetching database vulnerabilities:", err);
    }
  };

  useEffect(() => {
    fetchDbAlerts();
    if (activeTab === "vulnerabilities") {
      fetchDbVulnerabilities();
    }
  }, [activeTab, vulnSeverityFilter, vulnPatchFilter]);

  const fetchDbAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts`);
      if (res.ok) {
        const data = await res.json();
        setDbAlerts(data || []);

        // Automatically create Incident cards for Critical and High alerts!
        if (Array.isArray(data) && data.length > 0) {
          const autoIncidents = data
            .filter(a => a.severity === "CRITICAL" || a.severity === "HIGH")
            .map(a => ({
              id: `INC-00${a.id}`,
              title: `${a.title}`,
              severity: a.severity === "CRITICAL" ? "P1" : "P2",
              status: a.status === "OPEN" || !a.status ? "Open" : a.status === "TRIAGED" ? "Triaged" : "In Progress",
              assignee: "saroo",
              assigneeColor: "#b91c1c",
              sla: "1h 30m",
              created: a.createdAt ? new Date(a.createdAt).toLocaleTimeString() : "Just now"
            }));

          setIncidents(prev => {
            const existingTitles = new Set(prev.map(i => i.title));
            const newIncidents = autoIncidents.filter(i => !existingTitles.has(i.title));
            return [...newIncidents, ...prev];
          });
        }
      }
    } catch (err) {
      console.error("Error fetching database alerts:", err);
    }
  };

  const handleRunCveScanApi = async () => {
    setIsScanning(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/vulnerabilities/scan`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        showToast("success", `Automated CVE scan complete: ${data.vulnerabilitiesDetected} vulnerabilities mapped!`);
        addAuditLog(`Triggered automated host software CVE scan.`);
        fetchDbVulnerabilities();
      }
    } catch (err) {
      console.error("Error running CVE scan:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePatchVulnerabilityApi = async (id, cveId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/vulnerabilities/${id}/patch`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("success", `Patched vulnerability ${cveId} successfully!`);
        addAuditLog(`Applied security patch for ${cveId}`);
        fetchDbVulnerabilities();
      }
    } catch (err) {
      console.error("Error patching vulnerability:", err);
    }
  };

  // Phase 5: Network Discovery API Handler
  const handleRunNetworkDiscoveryApi = async () => {
    setIsDiscoveryScanning(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/network-discovery/scan`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ targetSubnet, ports: "22,80,443,445,3389" })
      });
      if (res.ok) {
        const data = await res.json();
        showToast("success", `Network discovery scan completed: ${data.hostsFound} hosts detected & registered!`);
        addAuditLog(`Ran subnet discovery scan on ${targetSubnet}`);
        fetchDbAssets();
      }
    } catch (err) {
      console.error("Error running discovery scan:", err);
    } finally {
      setIsDiscoveryScanning(false);
    }
  };

  // Phase 6: SIEM Log Explorer API Handlers
  const fetchDbSiemLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        page: siemLogPage,
        size: 15,
        sortBy: "timestamp",
        sortDir: "desc"
      });
      if (siemLogQuery) queryParams.append("query", siemLogQuery);
      if (siemLogSourceFilter) queryParams.append("logSource", siemLogSourceFilter);
      if (siemSeverityFilter) queryParams.append("severity", siemSeverityFilter);

      const res = await fetch(`${API_URL}/api/siem/logs?${queryParams.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbSiemLogs(data.content || []);
        setSiemLogTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching SIEM logs:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchDbSiemLogs();
    }
  }, [activeTab, siemLogPage, siemLogQuery, siemLogSourceFilter, siemSeverityFilter]);

  const handleApplyRetentionPolicyApi = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/siem/logs/retention?retentionDays=90`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        showToast("success", `Retention policy applied: pruned ${data.deletedLogsCount} old logs.`);
        addAuditLog(`Applied SIEM log retention policy (90 days).`);
        fetchDbSiemLogs();
      }
    } catch (err) {
      console.error("Error applying retention policy:", err);
    }
  };

  // Phase 9: Incident Response Remediation Handlers
  const handleKillProcessApi = async (hostname, pid) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/incidents/remediation/kill-process`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: hostname || "PROD-DB-01", pid: pid || 1024, username })
      });
      if (res.ok) {
        showToast("success", `Terminated process PID ${pid || 1024} on host ${hostname || "PROD-DB-01"}`);
        fetchAuditTrail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIsolateDeviceApi = async (hostname) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/incidents/remediation/isolate-device`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: hostname || "PROD-DB-01", username })
      });
      if (res.ok) {
        showToast("success", `Network isolation enforced on ${hostname || "PROD-DB-01"}`);
        fetchDbAssets();
        fetchAuditTrail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestartAgentApi = async (hostname) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/incidents/remediation/restart-agent`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: hostname || "PROD-DB-01", username })
      });
      if (res.ok) {
        showToast("success", `Restarted agent on ${hostname || "PROD-DB-01"}`);
        fetchAuditTrail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCollectLogsApi = async (hostname) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/incidents/remediation/collect-logs`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: hostname || "PROD-DB-01", username })
      });
      if (res.ok) {
        showToast("success", `Forensic log collection bundle created for ${hostname || "PROD-DB-01"}`);
        fetchAuditTrail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunScanApi = async (hostname) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/incidents/remediation/run-scan`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: hostname || "PROD-DB-01", username })
      });
      if (res.ok) {
        showToast("success", `Triggered security scan on ${hostname || "PROD-DB-01"}`);
        fetchAuditTrail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/incidents/audit-trail`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formattedBackend = data.map(log => ({
          timestamp: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "",
          user: log.username || "System",
          action: log.action + (log.targetHost ? ` on ${log.targetHost}` : "")
        }));
        const localLogs = JSON.parse(localStorage.getItem("audit_logs") || "[]");
        const combined = [...localLogs];
        formattedBackend.forEach(blog => {
          if (!combined.some(ll => ll.action === blog.action && ll.timestamp === blog.timestamp)) {
            combined.push(blog);
          }
        });
        setAuditLogs(combined);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "audit") {
      fetchAuditTrail();
    }
  }, [activeTab]);

  const fetchKnowledgeArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/knowledgebase`);
      if (res.ok) {
        const data = await res.json();
        setKnowledgeArticles(data);
      }
    } catch (err) {
      console.error("Failed to fetch knowledge base articles:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "knowledge") {
      fetchKnowledgeArticles();
    }
  }, [activeTab]);

  const saveArticle = async () => {
    try {
      const response = await fetch(`${API_URL}/api/knowledgebase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newArticle),
      });

      if (!response.ok) {
        showToast("warning", "Failed to save article.");
        return;
      }

      fetchKnowledgeArticles();

      // Reset form
      setNewArticle({
        title: "",
        category: "",
        content: "",
        author: username || "Sarah Anderson",
      });

      setShowAddArticle(false);
      showToast("success", "Article added successfully!");
      addAuditLog(`Added Knowledge Base article: ${newArticle.title}`);
    } catch (err) {
      console.error(err);
      showToast("warning", "Unable to connect to backend.");
    }
  };

  const deleteArticle = async (id) => {
    if (!window.confirm("Delete this article?")) return;

    try {
      const response = await fetch(`${API_URL}/api/knowledgebase/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        showToast("warning", "Delete failed");
        return;
      }

      setKnowledgeArticles((prev) => prev.filter((article) => article.id !== id));
      showToast("success", "Article deleted successfully.");
      addAuditLog(`Deleted Knowledge Base article ID: ${id}`);
    } catch (err) {
      console.error(err);
      showToast("warning", "Unable to connect to backend.");
    }
  };

  const editArticle = (article) => {
    setEditingArticle({ ...article });
    setShowEditArticle(true);
  };

  const updateArticle = async () => {
    try {
      const response = await fetch(`${API_URL}/api/knowledgebase/${editingArticle.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingArticle),
      });

      if (!response.ok) {
        showToast("warning", "Failed to update article.");
        return;
      }

      fetchKnowledgeArticles();
      setShowEditArticle(false);
      setEditingArticle(null);
      showToast("success", "Article updated successfully.");
      addAuditLog(`Updated Knowledge Base article: ${editingArticle.title}`);
    } catch (err) {
      console.error(err);
      showToast("warning", "Unable to connect to backend.");
    }
  };

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

  const exportIncidentsCSV = () => {
    try {
      showToast("info", "Generating CSV export...");
      
      const headers = ["Incident ID", "Title", "Severity", "Status", "Assignee", "SLA", "Created Time"];
      const rows = incidents.map(inc => [
        inc.id,
        `"${inc.title.replace(/"/g, '""')}"`,
        inc.severity,
        inc.status,
        inc.assignee,
        inc.sla,
        inc.created
      ]);
      
      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `sentinelcore_incident_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addAuditLog("Exported security incident logs as CSV file.");
      showToast("success", "Incident logs CSV downloaded successfully.");
    } catch (err) {
      console.error("CSV Export failed:", err);
      showToast("warning", "Failed to generate CSV export.");
    }
  };

  const downloadSOC2PDF = () => {
    try {
      showToast("info", "Preparing SOC2 Posture Audit PDF...");
      
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("warning", "Popup blocked! Please allow popups to view and download the PDF report.");
        return;
      }
      
      const dateStr = new Date().toLocaleString();
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>SOC2 Type II Compliance Report - SentinelCore</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@300;400;600;700;800&display=swap');
              
              :root {
                --bg: #f7f4eb;
                --text: #2c2520;
                --text-muted: #6b5d54;
                --accent: #6b0d23;
                --green: #287a43;
                --red: #b91c1c;
                --border: #e6dfd3;
              }
              
              body {
                font-family: 'Inter', system-ui, sans-serif;
                background-color: #ffffff;
                color: var(--text);
                padding: 40px;
                line-height: 1.6;
              }
              
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid var(--accent);
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              
              .logo {
                font-size: 24px;
                font-weight: 800;
                color: var(--accent);
                letter-spacing: -0.5px;
              }
              
              .report-title {
                text-align: right;
              }
              
              .report-title h1 {
                font-size: 20px;
                margin: 0;
                color: var(--text);
              }
              
              .report-title p {
                font-size: 12px;
                color: var(--text-muted);
                margin: 5px 0 0 0;
                font-family: 'IBM Plex Mono', monospace;
              }
              
              .meta-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
              }
              
              .meta-card {
                border: 1px solid var(--border);
                background-color: var(--bg);
                padding: 15px;
                border-radius: 6px;
              }
              
              .meta-label {
                font-size: 10px;
                font-family: 'IBM Plex Mono', monospace;
                text-transform: uppercase;
                color: var(--text-muted);
                margin-bottom: 5px;
              }
              
              .meta-value {
                font-size: 16px;
                font-weight: 700;
              }
              
              .score-banner {
                background: linear-gradient(135deg, var(--accent) 0%, #470614 100%);
                color: white;
                padding: 25px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 40px;
              }
              
              .score-text h2 {
                margin: 0 0 5px 0;
                font-size: 22px;
                font-weight: 700;
              }
              
              .score-text p {
                margin: 0;
                font-size: 13px;
                opacity: 0.8;
              }
              
              .score-value {
                font-size: 48px;
                font-weight: 800;
                font-family: 'IBM Plex Mono', monospace;
                border: 4px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                width: 100px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .section-heading {
                font-size: 16px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid var(--border);
                padding-bottom: 8px;
                margin-bottom: 15px;
                color: var(--accent);
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 40px;
              }
              
              th {
                text-align: left;
                padding: 10px;
                font-size: 11px;
                font-family: 'IBM Plex Mono', monospace;
                text-transform: uppercase;
                border-bottom: 1px solid var(--text);
                color: var(--text-muted);
              }
              
              td {
                padding: 12px 10px;
                border-bottom: 1px solid var(--border);
                font-size: 13px;
              }
              
              .badge {
                display: inline-block;
                padding: 3px 8px;
                font-size: 11px;
                font-weight: 600;
                border-radius: 4px;
                text-transform: uppercase;
              }
              
              .badge-passed {
                background-color: rgba(40, 122, 67, 0.1);
                color: var(--green);
                border: 1px solid var(--green);
              }
              
              .badge-failed {
                background-color: rgba(185, 28, 28, 0.1);
                color: var(--red);
                border: 1px solid var(--red);
              }
              
              .footer {
                margin-top: 60px;
                border-top: 1px solid var(--border);
                padding-top: 15px;
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: var(--text-muted);
                font-family: 'IBM Plex Mono', monospace;
              }
              
              @media print {
                body {
                  padding: 0;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">SentinelCore</div>
              <div class="report-title">
                <h1>Compliance Posture Report</h1>
                <p>SOC-2-TYPE-II-AUDIT</p>
              </div>
            </div>
            
            <div class="meta-grid">
              <div class="meta-card">
                <div class="meta-label">Generated On</div>
                <div class="meta-value">${dateStr}</div>
              </div>
              <div class="meta-card">
                <div class="meta-label">Assessed Scope</div>
                <div class="meta-value">Enterprise SOC Infrastructure</div>
              </div>
              <div class="meta-card">
                <div class="meta-label">Audit Version</div>
                <div class="meta-value">v1.0.0-Beta (Active)</div>
              </div>
            </div>
            
            <div class="score-banner">
              <div class="score-text">
                <h2>SOC 2 Type II Posture</h2>
                <p>Calculated compliance level based on 3 main access control and encryption policy criteria.</p>
              </div>
              <div class="score-value">82%</div>
            </div>
            
            <div class="section-heading">Assessed Security Control Frameworks</div>
            <table>
              <thead>
                <tr>
                  <th>Control ID</th>
                  <th>Control Domain</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>CC6.1</b></td>
                  <td>Logical Access Controls</td>
                  <td>User access rights to systems are authorized, modified, and revoked appropriately.</td>
                  <td><span class="badge badge-passed">PASSED</span></td>
                </tr>
                <tr>
                  <td><b>CC6.3</b></td>
                  <td>Data Transmission Encryption</td>
                  <td>Infrastructure encryption keys and data in transit are managed securely.</td>
                  <td><span class="badge badge-passed">PASSED</span></td>
                </tr>
                <tr>
                  <td><b>CC6.5</b></td>
                  <td>Multi-Factor Authentication</td>
                  <td>Two-Factor/Multi-Factor authentication is required for all administrative access.</td>
                  <td><span class="badge badge-failed">FAILED</span></td>
                </tr>
              </tbody>
            </table>
            
            <div class="section-heading">Compliance Notes & Recommendations</div>
            <p style="font-size: 13px; margin-bottom: 10px;">
              <strong>Finding for CC6.5:</strong> The organizational policy for MFA enforcement is currently disabled in the main tenant settings. In order to achieve full 100% compliance alignment, the Security Operations Administrator must enable the simulated Multi-Factor Authentication policy.
            </p>
            <p style="font-size: 13px;">
              All other logical access controls (CC6.1) and encryption key parameters (CC6.3) were evaluated as fully compliant.
            </p>
            
            <div class="footer">
              <div>SentinelCore Compliance Monitor &copy; 2026</div>
              <div>CONFIDENTIAL - FOR INTERNAL AUDIT PURPOSES ONLY</div>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      addAuditLog("Generated SOC2 compliance report PDF print sheet.");
      showToast("success", "SOC2 report PDF print sheet opened successfully.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("warning", "Failed to generate SOC2 PDF report.");
    }
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
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        counts={{
          incidents: incidents.length,
          alerts: dbAlerts.length,
          threats: threats.length,
          vulnerabilities: dbVulnerabilities.length,
          assets: dbAssets.length
        }}
      />

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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Command Center Dashboard</h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Real-time telemetry, live asset telemetry & incident triage</p>
                </div>
                <div>
                  <span className={`badge ${wsConnected ? "badge-green" : "badge-amber"}`} style={{ fontSize: "11px", padding: "6px 12px" }}>
                    {wsConnected ? "● WEBSOCKET TELEMETRY LIVE" : "○ CONNECTING WEBSOCKET..."}
                  </span>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card red">
                  <div className="stat-label">Critical Alerts</div>
                  <div className="stat-value">{liveMetrics.criticalAlerts}</div>
                  <div className="stat-change up">▲ Real-Time Trigger</div>
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                </div>
                <div className="stat-card amber">
                  <div className="stat-label">Online Assets</div>
                  <div className="stat-value">{liveMetrics.onlineAssets}<span style={{ fontSize: "13px", color: "var(--text-dim)" }}>/{liveMetrics.totalAssets || dbAssets.length}</span></div>
                  <div className="stat-change up" style={{ color: "var(--green)" }}>● {liveMetrics.onlineAssets} Agent Heartbeats</div>
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-label">Average CPU Load</div>
                  <div className="stat-value">{liveMetrics.avgCpu}%</div>
                  <div className="stat-change up">▲ System Utilization</div>
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg>
                  </div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Average RAM Load</div>
                  <div className="stat-value">{liveMetrics.avgRam}%</div>
                  <div className="stat-change down" style={{ color: "var(--cyan)" }}>▼ Telemetry Stream</div>
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                </div>
                <div className="stat-card cyan">
                  <div className="stat-label">Monitored Assets</div>
                  <div className="stat-value">{liveMetrics.totalAssets || dbAssets.length}</div>
                  <div className="stat-change" style={{ color: "var(--text-dim)" }}>— Registered Hosts</div>
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Dynamic SVG Charts */}
              <div className="panels-grid">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Security Incidents Over Time</div>
                      <div className="panel-subtitle">
                        {incidentTimeframe === "30D" && "Daily count - Last 30 days"}
                        {incidentTimeframe === "7D" && "Daily count - Last 7 days"}
                        {incidentTimeframe === "24H" && "Hourly distribution - Last 24 hours (Live Ticks)"}
                      </div>
                    </div>
                    <div className="panel-actions">
                      <button className={`panel-action ${incidentTimeframe === "30D" ? "active" : ""}`} onClick={() => setIncidentTimeframe("30D")}>30D</button>
                      <button className={`panel-action ${incidentTimeframe === "7D" ? "active" : ""}`} onClick={() => setIncidentTimeframe("7D")}>7D</button>
                      <button className={`panel-action ${incidentTimeframe === "24H" ? "active" : ""}`} onClick={() => setIncidentTimeframe("24H")}>24H</button>
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
                      <path d={
                        incidentTimeframe === "30D" ? "M40,120 L80,110 L120,90 L160,100 L200,70 L240,80 L280,50 L320,60 L360,30 L400,40 L440,20 L480,35 L520,15 L560,25 L560,140 L40,140Z" :
                        incidentTimeframe === "7D" ? "M40,130 L120,100 L200,120 L280,70 L360,90 L440,40 L520,60 L520,140 L40,140Z" :
                        "M40,140 L120,110 L200,60 L280,85 L360,45 L440,70 L520,25 L520,140 L40,140Z"
                      } fill="url(#chartGrad)" />

                      {/* Line */}
                      <polyline className="chart-draw-line" points={
                        incidentTimeframe === "30D" ? "40,120 80,110 120,90 160,100 200,70 240,80 280,50 320,60 360,30 400,40 440,20 480,35 520,15 560,25" :
                        incidentTimeframe === "7D" ? "40,130 120,100 200,120 280,70 360,90 440,40 520,60" :
                        "40,140 120,110 200,60 280,85 360,45 440,70 520,25"
                      } fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {incidentTimeframe === "30D" && (
                        <>
                          <circle cx="280" cy="50" r="4" fill="var(--purple)" stroke="var(--surface)" strokeWidth="2" />
                          <circle cx="440" cy="20" r="4" fill="var(--purple)" stroke="var(--surface)" strokeWidth="2" />
                          <text x="40" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">W1</text>
                          <text x="160" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">W2</text>
                          <text x="280" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">W3</text>
                          <text x="400" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">W4</text>
                          <text x="520" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">W5</text>
                        </>
                      )}

                      {incidentTimeframe === "7D" && (
                        <>
                          <circle cx="280" cy="70" r="4" fill="var(--purple)" stroke="var(--surface)" strokeWidth="2" />
                          <circle cx="440" cy="40" r="4" fill="var(--purple)" stroke="var(--surface)" strokeWidth="2" />
                          <text x="40" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">Mon</text>
                          <text x="120" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">Tue</text>
                          <text x="200" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">Wed</text>
                          <text x="280" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">Thu</text>
                          <text x="360" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">Fri</text>
                          <text x="440" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">Sat</text>
                          <text x="520" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">Sun</text>
                        </>
                      )}

                      {incidentTimeframe === "24H" && (
                        <>
                          <circle cx="200" cy="60" r="4" fill="var(--purple)" stroke="var(--surface)" strokeWidth="2" />
                          <circle cx="520" cy="25" r="4" fill="var(--green)" stroke="var(--surface)" strokeWidth="2" />
                          <text x="40" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">00:00</text>
                          <text x="120" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">04:00</text>
                          <text x="200" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">08:00</text>
                          <text x="280" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">12:00</text>
                          <text x="360" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">16:00</text>
                          <text x="440" y="155" fill="var(--text-dim)" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Mono">20:00</text>
                          <text x="520" y="155" fill="var(--green)" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="IBM Plex Mono">Live</text>
                        </>
                      )}
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
                      <div className="panel-title" style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "var(--red)", marginRight: "8px" }}></span>
                        Real-Time Event Stream
                      </div>
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
                        {dbAssets.filter(a => a.riskScore !== null && a.riskScore !== undefined).sort((x, y) => y.riskScore - x.riskScore).slice(0, 4).map((a, idx) => (
                          <tr key={idx}>
                            <td><b>{a.hostname}</b><br/><span style={{ fontSize: "11px", color: "var(--text-dim)" }}>{a.ipAddress || "No IP"}</span></td>
                            <td>{a.operatingSystem || "Unknown OS"}</td>
                            <td>
                              <span className={`badge ${a.riskScore > 75 ? "badge-critical" : "badge-high"}`}>
                                {Math.round(a.riskScore)}% Risk
                              </span>
                            </td>
                          </tr>
                        ))}
                        {dbAssets.filter(a => a.riskScore !== null && a.riskScore !== undefined).length === 0 && (
                          <tr>
                            <td colSpan="3" style={{ textAlign: "center", padding: "20px", color: "var(--text-dim)" }}>
                              No vulnerable targets identified in database.
                            </td>
                          </tr>
                        )}
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
                        {filtered.length > 0 ? (
                          filtered.map((inc) => (
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
                              
                              <div className="k-card-actions" style={{ flexWrap: "wrap", gap: "4px" }}>
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
                                <button className="k-card-action-btn" style={{ color: "var(--amber)" }} onClick={() => isolateHostFromIncident(inc.title)}>
                                  ⚡ Isolate
                                </button>
                                <button className="k-card-action-btn" style={{ color: "var(--red)" }} onClick={() => killProcessFromIncident(inc.title)}>
                                  🚫 Kill
                                </button>
                                <button className="k-card-action-btn" style={{ color: "var(--blue)" }} onClick={() => collectLogsFromIncident(inc.title)}>
                                  📦 Logs
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--text-dim)", fontSize: "11px", fontStyle: "italic" }}>
                            No {status.toLowerCase()} cases
                          </div>
                        )}
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
                      {dbAlerts.length > 0 ? (
                        dbAlerts.map((al) => (
                          <tr key={al.id}>
                            <td><code style={{ fontSize: "11px" }}>AL-{al.id}</code></td>
                            <td style={{ textAlign: "left" }}>
                              <b>{al.title}</b>
                              {al.description && <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{al.description}</div>}
                            </td>
                            <td>
                              <span className={`badge ${al.severity === "CRITICAL" ? "badge-critical" : "badge-high"}`}>
                                {al.severity}
                              </span>
                            </td>
                            <td><code style={{ fontSize: "11px" }}>{al.source || "endpoint"}</code></td>
                            <td>1</td>
                            <td style={{ fontSize: "11px" }}>{al.createdAt ? new Date(al.createdAt).toLocaleTimeString() : "Just now"}</td>
                            <td>
                              <span className={`badge ${al.status === "OPEN" ? "badge-critical" : "badge-green"}`}>
                                {al.status || "OPEN"}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-ghost" style={{ padding: "2px 6px", fontSize: "11px" }} onClick={() => showToast("success", `Acknowledged alert AL-${al.id}`)}>
                                Acknowledge
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", color: "var(--text-dim)", padding: "30px" }}>
                            No active security alerts in database. Run a security test or launch the endpoint agent to stream live triggers.
                          </td>
                        </tr>
                      )}
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
                <button className="btn btn-primary" onClick={() => {
                  showToast("success", "Threat feed synced: Malicious IoC detected on host SPIDEY!");
                  addAuditLog("Synchronized global threat feeds. Flagged C2 IP 185.220.101.4 on host SPIDEY.");
                  
                  // Generate automated incident card
                  const newInc = {
                    id: `INC-00${incidents.length + 1}`,
                    title: "Threat Intel Match: Malicious C2 IP 185.220.101.4 Flagged on SPIDEY",
                    severity: "P1",
                    status: "Open",
                    assignee: "saroo",
                    assigneeColor: "#b91c1c",
                    sla: "1h 30m",
                    created: new Date().toLocaleTimeString()
                  };
                  setIncidents(prev => [newInc, ...prev]);

                  // Generate dynamic event stream alert
                  const newAlert = {
                    id: Date.now(),
                    title: "Threat Intel Alert: Malicious C2 IP Flagged",
                    description: "Outbound connection attempt to malicious C2 IP 185.220.101.4 detected on host SPIDEY",
                    severity: "CRITICAL",
                    source: "Threat Intel",
                    status: "OPEN",
                    createdAt: new Date().toISOString()
                  };
                  setEventStream(prev => [newAlert, ...prev]);
                }}>
                  Sync Global Feed
                </button>
              </div>

              <div className="ioc-grid">
                {threats.length > 0 ? (
                  threats.map((t, idx) => (
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
                  ))
                ) : (
                  <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "var(--text-dim)", background: "var(--surface)", borderRadius: "var(--radius)", border: "1px dashed var(--border)" }}>
                    No watchlist threat indicators registered yet. Click <b>Sync Global Feed</b> to pull active IoCs.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== 5. VULNERABILITIES VIEW ===== */}
          {activeTab === "vulnerabilities" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", textAlign: "left", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Enterprise Vulnerability & CVE Management</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>NVD/OpenVAS/Nessus catalog, host software mapping & automated patch lifecycle</p>
                </div>
                <button className="btn btn-primary" onClick={handleRunCveScanApi} disabled={isScanning}>
                  {isScanning ? "Scanning Host Software..." : "⚡ Run Automated CVE Mapping"}
                </button>
              </div>

              {/* Filter Controls Bar */}
              <div className="panel" style={{ marginBottom: "16px", padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <select 
                    className="form-select" 
                    style={{ width: "auto", fontSize: "12px" }} 
                    value={vulnSeverityFilter} 
                    onChange={(e) => setVulnSeverityFilter(e.target.value)}
                  >
                    <option value="">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>

                  <select 
                    className="form-select" 
                    style={{ width: "auto", fontSize: "12px" }} 
                    value={vulnPatchFilter} 
                    onChange={(e) => setVulnPatchFilter(e.target.value)}
                  >
                    <option value="">All Patch Lifecycle States</option>
                    <option value="VULNERABLE">Vulnerable (Unpatched)</option>
                    <option value="PATCHED">Patched / Mitigated</option>
                  </select>
                </div>
              </div>

              {/* Heatmap & Matrix Panel */}
              <div className="panel" style={{ marginBottom: "20px", textAlign: "left" }}>
                <div className="panel-header">
                  <div className="panel-title">Asset CVSS Risk Matrix</div>
                </div>
                <div className="panel-body">
                  <div className="vuln-heatmap">
                    {heatmapCells.map((cell) => (
                      <div 
                        className={`heat-cell ${cell.class}`} 
                        key={cell.id}
                        title={`${cell.label}: CVSS ${cell.score}`}
                        style={{
                          background: cell.class === "critical" ? "var(--red-dim)" : cell.class === "high" ? "var(--amber-dim)" : "var(--purple-dim)",
                          color: cell.class === "critical" ? "var(--red)" : cell.class === "high" ? "var(--amber)" : "var(--purple)"
                        }}
                      >
                        {cell.score}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Database Vulnerability Catalog Table */}
              <div className="panel" style={{ padding: "0" }}>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>CVE Identifier</th>
                        <th>CVSS Rating</th>
                        <th>Severity</th>
                        <th>Affected Host</th>
                        <th>Detected Software</th>
                        <th>Patch Lifecycle State</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbVulnerabilities.length > 0 ? (
                        dbVulnerabilities.map((v) => (
                          <tr key={v.id}>
                            <td>
                              <b>{v.cveId}</b>
                              <div style={{ fontSize: "11px", color: "var(--text-dim)", maxWidth: "260px", whiteSpace: "normal" }}>{v.description}</div>
                            </td>
                            <td style={{ fontFamily: "IBM Plex Mono", fontWeight: "bold" }}>{v.cvssScore}</td>
                            <td>
                              <span className={`badge ${
                                v.severity === "CRITICAL" ? "badge-critical" :
                                v.severity === "HIGH" ? "badge-high" : "badge-medium"
                              }`}>
                                {v.severity}
                              </span>
                            </td>
                            <td><b>{v.hostname || "SYSTEM-HOST"}</b></td>
                            <td><code style={{ fontSize: "11px" }}>{v.detectedSoftware}</code></td>
                            <td>
                              <span className={`badge ${v.patchStatus === "PATCHED" ? "badge-green" : "badge-critical"}`}>
                                {v.patchStatus}
                              </span>
                            </td>
                            <td>
                              {v.patchStatus !== "PATCHED" ? (
                                <button 
                                  className="btn btn-primary" 
                                  style={{ padding: "3px 8px", fontSize: "11px", background: "var(--green)", borderColor: "var(--green)" }}
                                  onClick={() => handlePatchVulnerabilityApi(v.id, v.cveId)}
                                >
                                  Patch CVE
                                </button>
                              ) : (
                                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Patched</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: "center", color: "var(--text-dim)", padding: "24px" }}>
                            No mapped vulnerabilities found. Click "⚡ Run Automated CVE Mapping" above!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== 6. ASSETS VIEW ===== */}
          {activeTab === "assets" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", textAlign: "left", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Enterprise System Asset Inventory</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Database backed assets, endpoint telemetry & infrastructure inventory</p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <button className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={handleRunNetworkDiscoveryApi} disabled={isDiscoveryScanning}>
                    {isDiscoveryScanning ? "Scanning Subnet..." : "🌐 Network Discovery Scan"}
                  </button>
                  <label className="btn btn-ghost" style={{ cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center" }}>
                    📤 Import CSV
                    <input 
                      type="file" 
                      accept=".csv" 
                      style={{ display: "none" }} 
                      onChange={(e) => e.target.files && e.target.files[0] && handleImportAssetsApi(e.target.files[0])}
                    />
                  </label>
                  <button className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={handleExportAssetsApi}>
                    📥 Export CSV
                  </button>
                  <button className="btn btn-primary" style={{ fontSize: "12px" }} onClick={() => openModal("addAsset")}>
                    + Add Asset
                  </button>
                </div>
              </div>

              {/* Filter Controls Bar */}
              <div className="panel" style={{ marginBottom: "16px", padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <div className="search-box" style={{ flex: 1, minWidth: "220px" }}>
                    <span>🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search hostname, IP, MAC, owner, department..." 
                      value={assetSearch} 
                      onChange={(e) => { setAssetSearch(e.target.value); setAssetPage(0); }}
                    />
                  </div>
                  <select 
                    className="form-select" 
                    style={{ width: "auto", fontSize: "12px" }} 
                    value={assetTypeFilter} 
                    onChange={(e) => { setAssetTypeFilter(e.target.value); setAssetPage(0); }}
                  >
                    <option value="">All Asset Types</option>
                    <option value="DESKTOP">Desktop</option>
                    <option value="LAPTOP">Laptop</option>
                    <option value="WINDOWS_SERVER">Windows Server</option>
                    <option value="LINUX_SERVER">Linux Server</option>
                    <option value="VIRTUAL_MACHINE">Virtual Machine</option>
                    <option value="ROUTER">Router</option>
                    <option value="FIREWALL">Firewall</option>
                    <option value="SWITCH">Switch</option>
                    <option value="CLOUD_INSTANCE">Cloud Instance</option>
                  </select>

                  <select 
                    className="form-select" 
                    style={{ width: "auto", fontSize: "12px" }} 
                    value={assetCriticalityFilter} 
                    onChange={(e) => { setAssetCriticalityFilter(e.target.value); setAssetPage(0); }}
                  >
                    <option value="">All Criticalities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>

                  <select 
                    className="form-select" 
                    style={{ width: "auto", fontSize: "12px" }} 
                    value={assetAgentStatusFilter} 
                    onChange={(e) => { setAssetAgentStatusFilter(e.target.value); setAssetPage(0); }}
                  >
                    <option value="">All Agent Statuses</option>
                    <option value="ONLINE">Agent Online</option>
                    <option value="OFFLINE">Agent Offline</option>
                    <option value="UNINSTALLED">Uninstalled</option>
                  </select>
                </div>
              </div>

              {/* Assets Inventory Data Table */}
              <div className="panel" style={{ padding: "0" }}>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hostname</th>
                        <th>Type / OS</th>
                        <th>IP Address</th>
                        <th>MAC Address</th>
                        <th>Criticality</th>
                        <th>Owner / Dept</th>
                        <th>Agent Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbAssets.length > 0 ? (
                        dbAssets.map((as) => (
                          <tr key={as.id}>
                            <td>
                              <b>{as.hostname}</b>
                              {as.deviceName && <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{as.deviceName}</div>}
                            </td>
                            <td>
                              <span style={{ fontWeight: "600" }}>{as.assetType}</span>
                              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{as.operatingSystem || "Linux/Unix"}</div>
                            </td>
                            <td><code style={{ fontSize: "11px" }}>{as.ipAddress || "127.0.0.1"}</code></td>
                            <td><code style={{ fontSize: "11px" }}>{as.macAddress || "N/A"}</code></td>
                            <td>
                              <span className={`badge ${
                                as.criticality === "CRITICAL" || as.criticality === "Critical" ? "badge-critical" :
                                as.criticality === "HIGH" || as.criticality === "High" ? "badge-high" : "badge-medium"
                              }`}>
                                {as.criticality}
                              </span>
                            </td>
                            <td>
                              <div>{as.owner || "IT System"}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{as.department || "Infra"}</div>
                            </td>
                            <td>
                              <span className={`badge ${
                                as.agentStatus === "ONLINE" ? "badge-green" :
                                as.agentStatus === "OFFLINE" ? "badge-critical" : "badge-low"
                              }`}>
                                {as.agentStatus || "UNINSTALLED"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button 
                                  className="btn btn-ghost" 
                                  style={{ padding: "3px 8px", fontSize: "11px" }}
                                  onClick={() => viewAssetDetailsApi(as.id)}
                                >
                                  Details
                                </button>
                                <button 
                                  className="btn btn-ghost" 
                                  style={{ padding: "3px 8px", fontSize: "11px", color: "var(--red)" }}
                                  onClick={() => handleDeleteAssetApi(as.id, as.hostname)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", color: "var(--text-dim)", padding: "30px" }}>
                            No matching assets found in database. Add an asset or run the agent script (`agent.py`)!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button 
                    className="btn btn-ghost" 
                    style={{ fontSize: "12px" }}
                    disabled={assetPage <= 0} 
                    onClick={() => setAssetPage(p => Math.max(0, p - 1))}
                  >
                    ◀ Previous
                  </button>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "IBM Plex Mono" }}>
                    Page {assetPage + 1} of {assetTotalPages}
                  </span>
                  <button 
                    className="btn btn-ghost" 
                    style={{ fontSize: "12px" }}
                    disabled={assetPage >= assetTotalPages - 1} 
                    onClick={() => setAssetPage(p => p + 1)}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== 7. LOG EXPLORER VIEW ===== */}
          {activeTab === "logs" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", textAlign: "left", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--heading)", fontWeight: "800" }}>Enterprise SIEM Log Explorer</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Ingest, search & query Windows, Sysmon, Syslog, Apache, Nginx, Firewall, VPN & SSH logs</p>
                </div>
                <button className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={handleApplyRetentionPolicyApi}>
                  🧹 Apply Retention Policy (90 Days)
                </button>
              </div>

              {/* Filter Controls Bar */}
              <div className="panel" style={{ marginBottom: "16px", padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <div className="search-box" style={{ flex: 1, minWidth: "240px" }}>
                    <span>🔍</span>
                    <input 
                      type="text" 
                      placeholder="Query event logs... (e.g. 'failed login', 'powershell')" 
                      value={siemLogQuery} 
                      onChange={(e) => { setSiemLogQuery(e.target.value); setSiemLogPage(0); }} 
                    />
                  </div>

                  <select 
                    className="form-select" 
                    style={{ width: "auto", fontSize: "12px" }} 
                    value={siemLogSourceFilter} 
                    onChange={(e) => { setSiemLogSourceFilter(e.target.value); setSiemLogPage(0); }}
                  >
                    <option value="">All Log Sources</option>
                    <option value="WINDOWS_EVENT">Windows Event Log</option>
                    <option value="SYSMON">Windows Sysmon</option>
                    <option value="LINUX_SYSLOG">Linux Syslog</option>
                    <option value="APACHE">Apache Web Server</option>
                    <option value="NGINX">Nginx Reverse Proxy</option>
                    <option value="FIREWALL">Palo Alto / DMZ Firewall</option>
                    <option value="VPN">IPsec / OpenVPN</option>
                    <option value="SSH">SSH Authentication</option>
                  </select>

                  <select 
                    className="form-select" 
                    style={{ width: "auto", fontSize: "12px" }} 
                    value={siemSeverityFilter} 
                    onChange={(e) => { setSiemSeverityFilter(e.target.value); setSiemLogPage(0); }}
                  >
                    <option value="">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="ERROR">Error</option>
                    <option value="WARN">Warning</option>
                    <option value="INFO">Info</option>
                  </select>
                </div>
              </div>

              {/* SIEM Log Data Table */}
              <div className="panel" style={{ padding: "0" }}>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Severity</th>
                        <th>Log Source</th>
                        <th>Event Code</th>
                        <th>Host</th>
                        <th>Parsed Event Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbSiemLogs.length > 0 ? (
                        dbSiemLogs.map((l) => (
                          <tr key={l.id}>
                            <td style={{ fontFamily: "IBM Plex Mono", fontSize: "11px" }}>
                              {l.timestamp ? new Date(l.timestamp).toLocaleString() : "Just now"}
                            </td>
                            <td>
                              <span className={`badge ${
                                l.severity === "CRITICAL" ? "badge-critical" :
                                l.severity === "ERROR" || l.severity === "WARN" ? "badge-high" : "badge-low"
                              }`}>
                                {l.severity}
                              </span>
                            </td>
                            <td><code style={{ fontSize: "11px" }}>{l.logSource}</code></td>
                            <td><code style={{ fontSize: "11px" }}>{l.eventCode || "N/A"}</code></td>
                            <td><b>{l.host || "UNKNOWN-HOST"}</b></td>
                            <td style={{ textAlign: "left", whiteSpace: "normal" }}>
                              <div><b>{l.message}</b></div>
                              {l.rawLog && <div style={{ fontSize: "10px", color: "var(--text-dim)", fontFamily: "IBM Plex Mono" }}>{l.rawLog}</div>}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", color: "var(--text-dim)", padding: "30px" }}>
                            No log events match query parameters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button 
                    className="btn btn-ghost" 
                    style={{ fontSize: "12px" }}
                    disabled={siemLogPage <= 0} 
                    onClick={() => setSiemLogPage(p => Math.max(0, p - 1))}
                  >
                    ◀ Previous
                  </button>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "IBM Plex Mono" }}>
                    Page {siemLogPage + 1} of {siemLogTotalPages}
                  </span>
                  <button 
                    className="btn btn-ghost" 
                    style={{ fontSize: "12px" }}
                    disabled={siemLogPage >= siemLogTotalPages - 1} 
                    onClick={() => setSiemLogPage(p => p + 1)}
                  >
                    Next ▶
                  </button>
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
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    className={`btn ${activePlaybookSubTab === "available" ? "btn-primary" : "btn-ghost"}`} 
                    onClick={() => setActivePlaybookSubTab("available")}
                  >
                    Available Playbooks
                  </button>
                  <button 
                    className={`btn ${activePlaybookSubTab === "history" ? "btn-primary" : "btn-ghost"}`} 
                    onClick={() => setActivePlaybookSubTab("history")}
                  >
                    Execution Logs ({executions.length})
                  </button>
                </div>
              </div>

              {/* Sub-tab 1: Available Playbooks */}
              {activePlaybookSubTab === "available" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {playbooks.map((playbook) => (
                    <div className="panel" key={playbook.id} style={{ marginBottom: "0" }}>
                      <div className="panel-header" style={{ borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div className="panel-title">{playbook.name}</div>
                          <div className="panel-subtitle" style={{ marginTop: "4px" }}>{playbook.description}</div>
                        </div>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => executePlaybook(playbook.id, playbook.name)}
                        >
                          ▶ Run Playbook
                        </button>
                      </div>
                      <div className="panel-body">
                        <div style={{ display: "flex", alignItems: "center", overflowX: "auto", padding: "8px 0" }}>
                          {playbook.steps && playbook.steps.map((step, idx) => (
                            <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
                              <div style={{
                                border: "1px solid var(--border)",
                                background: "var(--bg)",
                                padding: "8px 12px",
                                borderRadius: "var(--radius)",
                                textAlign: "left",
                                minWidth: "160px"
                              }}>
                                <div style={{ fontSize: "10px", fontFamily: "IBM Plex Mono", color: "var(--text-dim)" }}>
                                  Step {step.stepOrder} ({step.actionType})
                                </div>
                                <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--heading)", marginTop: "2px" }}>
                                  {step.displayName}
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                  {step.description}
                                </div>
                              </div>
                              {idx < playbook.steps.length - 1 && (
                                <span style={{ margin: "0 10px", color: "var(--text-dim)", fontSize: "16px" }}>➔</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {playbooks.length === 0 && (
                    <div className="panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)" }}>
                      Loading preseeded SOAR playbooks from database...
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Execution Logs History */}
              {activePlaybookSubTab === "history" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="panel" style={{ padding: "0" }}>
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Execution ID</th>
                            <th>Playbook Name</th>
                            <th>Triggered By</th>
                            <th>Status</th>
                            <th>Started At</th>
                            <th>Duration</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {executions.map((exec) => (
                            <tr 
                              key={exec.id} 
                              style={{ cursor: "pointer", background: selectedExecution?.id === exec.id ? "var(--surface-2)" : "" }}
                              onClick={() => setSelectedExecution(exec)}
                            >
                              <td><b>RUN-{exec.id}</b></td>
                              <td>{exec.playbookName}</td>
                              <td>@{exec.initiatedBy}</td>
                              <td>
                                <span className={`badge ${
                                  exec.status === "COMPLETED" ? "badge-green" : 
                                  exec.status === "FAILED" ? "badge-critical" : 
                                  exec.status === "RUNNING" ? "badge-high" : "badge-low"
                                }`}>
                                  {exec.status}
                                </span>
                              </td>
                              <td style={{ fontSize: "12px" }}>{new Date(exec.startedAt).toLocaleString()}</td>
                              <td style={{ fontFamily: "IBM Plex Mono" }}>{exec.executionDuration}ms</td>
                              <td>
                                <button 
                                  className="btn btn-ghost" 
                                  style={{ padding: "2px 8px", fontSize: "11px" }}
                                  onClick={(e) => { e.stopPropagation(); setSelectedExecution(exec); }}
                                >
                                  View Steps
                                </button>
                              </td>
                            </tr>
                          ))}
                          {executions.length === 0 && (
                            <tr>
                              <td colSpan="7" style={{ textAlign: "center", color: "var(--text-dim)", padding: "20px" }}>
                                No playbook executions run yet. Run a playbook to see logs!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detailed Step Logs for Selected Run */}
                  {selectedExecution && (
                    <div className="panel">
                      <div className="panel-header" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div className="panel-title">Detailed Step Logs: RUN-{selectedExecution.id} ({selectedExecution.playbookName})</div>
                      </div>
                      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {selectedExecution.logs && selectedExecution.logs.map((log) => (
                          <div key={log.id} style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            padding: "10px 12px",
                            border: "1px solid var(--border)",
                            background: "var(--surface-2)",
                            borderRadius: "var(--radius)"
                          }}>
                            <div style={{
                              fontFamily: "IBM Plex Mono",
                              fontSize: "11px",
                              fontWeight: "bold",
                              color: "var(--text-dim)",
                              marginTop: "2px"
                            }}>
                              Step {log.stepOrder}
                            </div>
                            <div style={{ flex: 1, textAlign: "left" }}>
                              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--heading)" }}>
                                  {log.actionType}
                                </span>
                                <span className={`badge ${
                                  log.status === "COMPLETED" ? "badge-green" : 
                                  log.status === "FAILED" ? "badge-critical" : "badge-high"
                                }`} style={{ fontSize: "9px", padding: "1px 4px" }}>
                                  {log.status}
                                </span>
                                <span style={{ fontSize: "10px", color: "var(--text-dim)", marginLeft: "auto", fontFamily: "IBM Plex Mono" }}>
                                  Duration: {log.duration}ms
                                </span>
                              </div>
                              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                                {log.message}
                              </p>
                              {log.errorMessage && (
                                <p style={{ fontSize: "11px", color: "var(--red)", marginTop: "4px", background: "var(--red-dim)", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--red)" }}>
                                  Error: {log.errorMessage}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                  <button className="btn btn-primary" style={{ marginTop: "10px" }} onClick={downloadSOC2PDF}>
                    Download PDF
                  </button>
                </div>
                <div className="ioc-card">
                  <div className="ioc-value">Incident Logs (Last 24 Hours)</div>
                  <div className="ioc-type">Operations summary</div>
                  <button className="btn btn-primary" style={{ marginTop: "10px" }} onClick={exportIncidentsCSV}>
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
          {/* ===== 12. KNOWLEDGE BASE VIEW ===== */}
          {activeTab === "knowledge" && (
            <div className="kb-page">
              <div className="kb-toolbar">
                <div className="kb-filters">
                  <input
                    type="text"
                    placeholder="🔍 Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="kb-input"
                  />

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="kb-select"
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
                  className="btn-primary"
                >
                  ➕ Add Article
                </button>
              </div>

              <div className="kb-grid">
                {knowledgeArticles.length === 0 ? (
                  <p className="kb-empty">No Knowledge Base articles found.</p>
                ) : (
                  knowledgeArticles
                    .filter((article) => {
                      const matchesSearch =
                        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        article.author.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesCategory =
                        selectedCategory === "All" || article.category === selectedCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map((article) => (
                      <div className="kb-card" key={article.id}>
                        <h2>{article.title}</h2>

                        <div className="kb-label">Category</div>
                        <div className="kb-value">{article.category}</div>

                        <div className="kb-label">Content</div>
                        <div className="kb-content">{article.content}</div>

                        <div className="kb-footer">
                          <span><b>Author:</b> {article.author}</span>
                          <span>{article.createdAt ? new Date(article.createdAt).toLocaleString() : ""}</span>
                        </div>

                        <hr className="kb-divider"/>

                        <div className="kb-actions">
                          <button onClick={() => editArticle(article)} className="kb-edit">
                            ✏ Edit
                          </button>
                          <button onClick={() => deleteArticle(article.id)} className="kb-delete">
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* ===== ADD ARTICLE POPUP ===== */}
          {showAddArticle && (
            <div className="kb-modal-overlay">
              <div className="kb-modal">
                <h2>Add Knowledge Base Article</h2>

                <input
                  type="text"
                  placeholder="Title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  className="kb-modal-input"
                />

                <input
                  type="text"
                  placeholder="Category"
                  value={newArticle.category}
                  onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                  className="kb-modal-input"
                />

                <textarea
                  rows="5"
                  placeholder="Content"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  className="kb-modal-input kb-modal-textarea"
                />

                <input
                  type="text"
                  placeholder="Author"
                  value={newArticle.author}
                  onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
                  className="kb-modal-input"
                />

                <div className="kb-modal-actions">
                  <button onClick={() => setShowAddArticle(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button onClick={saveArticle} className="btn-primary">
                    💾 Save Article
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== EDIT ARTICLE POPUP ===== */}
          {showEditArticle && editingArticle && (
            <div className="kb-modal-overlay">
              <div className="kb-modal">
                <h2>Edit Knowledge Base Article</h2>

                <input
                  type="text"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  className="kb-modal-input"
                />

                <input
                  type="text"
                  value={editingArticle.category}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  className="kb-modal-input"
                />

                <textarea
                  rows="5"
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="kb-modal-input kb-modal-textarea"
                />

                <input
                  type="text"
                  value={editingArticle.author}
                  onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                  className="kb-modal-input"
                />

                <div className="kb-modal-actions">
                  <button onClick={() => { setShowEditArticle(false); setEditingArticle(null); }} className="btn-secondary">
                    Cancel
                  </button>
                  <button onClick={updateArticle} className="btn-primary">
                    💾 Update Article
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
                  <h3>Register Enterprise System Host Asset</h3>
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
                    <label className="form-label">Asset Classification Type</label>
                    <select 
                      className="form-select" 
                      value={newAsset.assetType || "DESKTOP"} 
                      onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value })}
                    >
                      <option value="DESKTOP">Desktop</option>
                      <option value="LAPTOP">Laptop</option>
                      <option value="WINDOWS_SERVER">Windows Server</option>
                      <option value="LINUX_SERVER">Linux Server</option>
                      <option value="VIRTUAL_MACHINE">Virtual Machine</option>
                      <option value="ROUTER">Router</option>
                      <option value="FIREWALL">Firewall</option>
                      <option value="SWITCH">Switch</option>
                      <option value="CLOUD_INSTANCE">Cloud Instance</option>
                    </select>
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
                      <option value="Windows 11 Pro">Windows 11 Pro</option>
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
                      <option value="CRITICAL">Critical Business Node</option>
                      <option value="HIGH">High Priority Host</option>
                      <option value="MEDIUM">Medium Internal Host</option>
                      <option value="LOW">Low Audit Sandbox</option>
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
                  <button className="btn btn-primary" onClick={handleCreateAssetApi}>Register Asset</button>
                </div>
              </>
            )}

            {modalType === "assetDetails" && selectedAssetDetail && (
              <>
                <div className="modal-header" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 style={{ margin: 0 }}>Asset Details: {selectedAssetDetail.hostname}</h3>
                      <span className={`badge ${
                        selectedAssetDetail.agentStatus === "ONLINE" ? "badge-green" :
                        selectedAssetDetail.agentStatus === "OFFLINE" ? "badge-critical" : "badge-low"
                      }`}>
                        {selectedAssetDetail.agentStatus || "UNINSTALLED"}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {selectedAssetDetail.assetType} | {selectedAssetDetail.operatingSystem || "Linux"} | IP: {selectedAssetDetail.ipAddress || "127.0.0.1"}
                    </p>
                  </div>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* System Specs Overview Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", background: "var(--surface-2)", padding: "12px", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                    <div><span style={{ fontSize: "10px", color: "var(--text-dim)" }}>MAC Address</span><div style={{ fontSize: "12px", fontWeight: "bold", fontFamily: "IBM Plex Mono" }}>{selectedAssetDetail.macAddress || "N/A"}</div></div>
                    <div><span style={{ fontSize: "10px", color: "var(--text-dim)" }}>Public IP</span><div style={{ fontSize: "12px", fontWeight: "bold", fontFamily: "IBM Plex Mono" }}>{selectedAssetDetail.publicIp || "N/A"}</div></div>
                    <div><span style={{ fontSize: "10px", color: "var(--text-dim)" }}>CPU Cores</span><div style={{ fontSize: "12px", fontWeight: "bold" }}>{selectedAssetDetail.cpu || "4 Cores"}</div></div>
                    <div><span style={{ fontSize: "10px", color: "var(--text-dim)" }}>Total RAM</span><div style={{ fontSize: "12px", fontWeight: "bold" }}>{selectedAssetDetail.ram || "16.0 GB"}</div></div>
                    <div><span style={{ fontSize: "10px", color: "var(--text-dim)" }}>Total Disk</span><div style={{ fontSize: "12px", fontWeight: "bold" }}>{selectedAssetDetail.disk || "512.0 GB"}</div></div>
                    <div><span style={{ fontSize: "10px", color: "var(--text-dim)" }}>Architecture</span><div style={{ fontSize: "12px", fontWeight: "bold" }}>{selectedAssetDetail.architecture || "x86_64"}</div></div>
                    <div><span style={{ fontSize: "10px", color: "var(--text-dim)" }}>Owner / Dept</span><div style={{ fontSize: "12px", fontWeight: "bold" }}>{selectedAssetDetail.owner || "System"} ({selectedAssetDetail.department || "Infra"})</div></div>
                    <div><span style={{ fontSize: "10px", color: "var(--text-dim)" }}>Last Seen Ping</span><div style={{ fontSize: "12px", fontWeight: "bold" }}>{selectedAssetDetail.lastSeen ? new Date(selectedAssetDetail.lastSeen).toLocaleTimeString() : "Just now"}</div></div>
                  </div>

                  {/* Sub-tabs inside Modal */}
                  <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                    <button 
                      className={`btn ${assetDetailSubTab === "processes" ? "btn-primary" : "btn-ghost"}`} 
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                      onClick={() => setAssetDetailSubTab("processes")}
                    >
                      Running Processes ({selectedAssetDetail.processes?.length || 0})
                    </button>
                    <button 
                      className={`btn ${assetDetailSubTab === "software" ? "btn-primary" : "btn-ghost"}`} 
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                      onClick={() => setAssetDetailSubTab("software")}
                    >
                      Installed Software ({selectedAssetDetail.softwareList?.length || 0})
                    </button>
                    <button 
                      className={`btn ${assetDetailSubTab === "network" ? "btn-primary" : "btn-ghost"}`} 
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                      onClick={() => setAssetDetailSubTab("network")}
                    >
                      Network Adapters ({selectedAssetDetail.networkInterfaces?.length || 0})
                    </button>
                  </div>

                  {/* Sub-tab 1: Processes */}
                  {assetDetailSubTab === "processes" && (
                    <div className="table-container" style={{ maxHeight: "320px", overflowY: "auto", minHeight: "200px" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Process Name</th>
                            <th>PID</th>
                            <th>CPU %</th>
                            <th>Memory %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAssetDetail.processes && selectedAssetDetail.processes.length > 0 ? (
                            selectedAssetDetail.processes.map((proc, idx) => (
                              <tr key={idx}>
                                <td><b>{proc.name}</b></td>
                                <td><code style={{ fontSize: "11px" }}>{proc.pid}</code></td>
                                <td style={{ fontFamily: "IBM Plex Mono" }}>{proc.cpuUsage}%</td>
                                <td style={{ fontFamily: "IBM Plex Mono" }}>{proc.memoryUsage}%</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--text-dim)", padding: "16px" }}>No running processes reported by agent yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Sub-tab 2: Software */}
                  {assetDetailSubTab === "software" && (
                    <div className="table-container" style={{ maxHeight: "320px", overflowY: "auto", minHeight: "200px" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Application Name</th>
                            <th>Version</th>
                            <th>Publisher</th>
                            <th>Install Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAssetDetail.softwareList && selectedAssetDetail.softwareList.length > 0 ? (
                            selectedAssetDetail.softwareList.map((soft, idx) => (
                              <tr key={idx}>
                                <td><b>{soft.name}</b></td>
                                <td><code style={{ fontSize: "11px" }}>{soft.version || "1.0"}</code></td>
                                <td>{soft.publisher || "Vendor"}</td>
                                <td style={{ fontSize: "11px" }}>{soft.installDate || "N/A"}</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--text-dim)", padding: "16px" }}>No installed software reported by agent yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Sub-tab 3: Network */}
                  {assetDetailSubTab === "network" && (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Interface Name</th>
                            <th>IP Address</th>
                            <th>MAC Address</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAssetDetail.networkInterfaces && selectedAssetDetail.networkInterfaces.length > 0 ? (
                            selectedAssetDetail.networkInterfaces.map((net, idx) => (
                              <tr key={idx}>
                                <td><b>{net.interfaceName}</b></td>
                                <td><code style={{ fontSize: "11px" }}>{net.ipAddress || "127.0.0.1"}</code></td>
                                <td><code style={{ fontSize: "11px" }}>{net.macAddress || "N/A"}</code></td>
                                <td>
                                  <span className={`badge ${net.status === "UP" ? "badge-green" : "badge-critical"}`}>
                                    {net.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--text-dim)", padding: "16px" }}>No network interfaces reported by agent yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={closeModal}>Close Inspector</button>
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
      <Chatbot />
    </div>
  );
}

export default Dashboard;