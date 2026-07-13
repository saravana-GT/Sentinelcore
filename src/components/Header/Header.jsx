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
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input type="text" placeholder="Search logs, CVEs, assets..." />
        </div>

        <button className="topbar-btn notif-dot" onClick={handleNotificationClick} title="View Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: "middle"}}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        {role === "VIEWER" ? (
          <button 
            className="topbar-btn" 
            disabled 
            style={{ opacity: 0.5, cursor: "not-allowed" }}
            title="Read-Only Viewer Mode"
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              New Incident (Viewer)
            </span>
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