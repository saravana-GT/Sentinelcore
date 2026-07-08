import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import DashboardCards from "../../components/Cards/DashboardCards";
import SecurityChart from "../../components/Charts/SecurityChart";
import DeviceTable from "../../components/DeviceTable/DeviceTable";
import RiskScore from "../../components/RiskScore/RiskScore";


function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Header />

        <div style={{ padding: "30px" }}>
          
          <h2>Welcome to SentinelCore</h2>
          <p>Enterprise Security Operations Center</p>

          <DashboardCards />
          <RiskScore/>
          <SecurityChart />
          <DeviceTable />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;