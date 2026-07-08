import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>🛡 SentinelCore</h2>

      <ul>
        <li>🏠 Dashboard</li>
        <li>👤 Users</li>
        <li>💻 Devices</li>
        <li>📜 Activity Logs</li>
        <li>🚨 Alerts</li>
        <li>⚠ Incidents</li>
        <li>📧 Email Scanner</li>
        <li>📂 File Scanner</li>
        <li>Admin Settings</li>
        <li>⚙ Settings</li>
        <li>📊 Reports</li>
      </ul>
    </div>
  );
}

export default Sidebar;