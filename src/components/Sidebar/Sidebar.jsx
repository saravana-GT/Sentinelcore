import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Sarah Anderson");
  const [role, setRole] = useState("ADMIN");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setRole(storedRole);
  }, []);

  const handleLogout = () => {
    // Audit logout action
    const auditLogs = JSON.parse(localStorage.getItem("audit_logs") || "[]");
    auditLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      user: username,
      action: "Logged out of SentinelCore session."
    });
    localStorage.setItem("audit_logs", JSON.stringify(auditLogs));

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const renderRoleLabel = (r) => {
    if (r === "ADMIN") return "ADMIN · SOC Lead";
    if (r === "ANALYST") return "ANALYST · SOC Handler";
    return "VIEWER · Guest Read-Only";
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="logo">S</div>
        <div>
          <div className="brand-text">Sentinel<span>Core</span></div>
          <div className="brand-ver">v1.0.0-beta</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section">Operations</div>
        <button
          className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <span className="nav-icon">📊</span> Dashboard
        </button>
        <button
          className={`nav-item ${activeTab === "incidents" ? "active" : ""}`}
          onClick={() => setActiveTab("incidents")}
        >
          <span className="nav-icon">🚨</span> Incidents
          <span className="nav-badge badge-red">12</span>
        </button>
        <button
          className={`nav-item ${activeTab === "alerts" ? "active" : ""}`}
          onClick={() => setActiveTab("alerts")}
        >
          <span className="nav-icon">🔔</span> Alerts
          <span className="nav-badge badge-amber">34</span>
        </button>
        <button
          className={`nav-item ${activeTab === "threats" ? "active" : ""}`}
          onClick={() => setActiveTab("threats")}
        >
          <span className="nav-icon">🎯</span> Threat Intel
          <span className="nav-badge badge-red">8</span>
        </button>

        <div className="nav-section">Security</div>
        <button
          className={`nav-item ${activeTab === "vulnerabilities" ? "active" : ""}`}
          onClick={() => setActiveTab("vulnerabilities")}
        >
          <span className="nav-icon">🛡️</span> Vulnerabilities
          <span className="nav-badge badge-amber">156</span>
        </button>
        <button
          className={`nav-item ${activeTab === "assets" ? "active" : ""}`}
          onClick={() => setActiveTab("assets")}
        >
          <span className="nav-icon">🖥️</span> Assets
          <span className="nav-badge badge-blue">89</span>
        </button>
        <button
          className={`nav-item ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          <span className="nav-icon">📋</span> Log Explorer
        </button>
        <button
          className={`nav-item ${activeTab === "playbooks" ? "active" : ""}`}
          onClick={() => setActiveTab("playbooks")}
        >
          <span className="nav-icon">⚙️</span> Playbooks
        </button>

        <div className="nav-section">Governance</div>
        <button
          className={`nav-item ${activeTab === "compliance" ? "active" : ""}`}
          onClick={() => setActiveTab("compliance")}
        >
          <span className="nav-icon">✅</span> Compliance
          <span className="nav-badge badge-green">78%</span>
        </button>
        <button
          className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <span className="nav-icon">📄</span> Reports
        </button>
        <button
          className={`nav-item ${activeTab === "audit" ? "active" : ""}`}
          onClick={() => setActiveTab("audit")}
        >
          <span className="nav-icon">🔍</span> Audit Trail
        </button>
        <button
          className={`nav-item ${activeTab === "knowledge" ? "active" : ""}`}
          onClick={() => setActiveTab("knowledge")}
        >
          <span className="nav-icon">📚</span> Knowledge Base
        </button>

        {role === "ADMIN" && (
          <>
            <div className="nav-section">System</div>
            <button
              className={`nav-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <span className="nav-icon">👥</span> Users & Teams
            </button>
            <button
              className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <span className="nav-icon">⚙️</span> Settings
            </button>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{getInitials(username)}</div>
          <div className="user-info">
            <div className="name">{username}</div>
            <div className="role">{renderRoleLabel(role)}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;