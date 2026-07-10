import { useEffect, useState } from "react";
import "./Header.css";

function Header({ activeTab, onNewIncidentClick, showToast }) {
  const [role, setRole] = useState("ADMIN");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  const handleNotificationClick = () => {
    if (showToast) {
      showToast("info", "3 new alerts detected from Firewall zone DMZ-Primary");
    }
  };

  const getBreadcrumbName = (tab) => {
    switch (tab) {
      case "dashboard": return "Dashboard";
      case "incidents": return "Incident Management";
      case "alerts": return "Alert Queue";
      case "threats": return "Threat Intelligence";
      case "vulnerabilities": return "Vulnerability Scanner";
      case "assets": return "Asset Inventory";
      case "logs": return "Log Explorer";
      case "playbooks": return "Playbook Automation";
      case "compliance": return "Compliance Manager";
      case "reports": return "Report Generator";
      case "audit": return "Audit Trail";
      case "knowledge": return "Knowledge Base";
      case "users": return "Users & Teams";
      case "settings": return "Settings & Config";
      default: return "Dashboard";
    }
  };

  return (
    <div className="topbar">
      <div className="breadcrumb">
        SentinelCore / <b>{getBreadcrumbName(activeTab)}</b>
      </div>

      <div className="topbar-actions">
        <div className="search-box">
          <span>🔍</span>
          <input type="text" placeholder="Search logs, CVEs, assets..." />
        </div>

        <button className="topbar-btn notif-dot" onClick={handleNotificationClick} title="View Notifications">
          🔔
        </button>

        {role === "VIEWER" ? (
          <button 
            className="topbar-btn" 
            disabled 
            style={{ opacity: 0.5, cursor: "not-allowed" }}
            title="Read-Only Viewer Mode"
          >
            🔒 New Incident (Viewer)
          </button>
        ) : (
          <button className="topbar-btn" onClick={onNewIncidentClick} style={{ background: "var(--accent)", color: "#fff", border: "1px solid var(--accent)" }}>
            + New Incident
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;