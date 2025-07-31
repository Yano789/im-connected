import AIDashboard from "../AIDashboard/AIDashboard";
import MedDashboard from "../MedDashboard/MedDashboard";
import ForumDashboard from "../ForumDashboard/ForumDashboard"
import "./DashboardBody.css";

function DashboardBody(){
    return(
<div className="dashboard-div">
  <div className="dashboard-grid">
    <div className="dashboardItem">
      <MedDashboard />
    </div>
    <div className="dashboardItem">
      <ForumDashboard/>
    </div>
    <div className="dashboardItem">
      <AIDashboard/>
    </div>
  </div>
</div>


    );
}
export default DashboardBody;