import AIDashboard from "../AIDashboard/AIDashboard";
import MedDashboard from "../MedDashboard/MedDashboard";
import "./DashboardBody.css";

function DashboardBody(){
    return(
<div className="dashboard-div">
  <div className="dashboard-grid">
    <div className="border p-4">
      <MedDashboard />
    </div>
    <div className="border p-4">
      <AIDashboard/>
    </div>
    <div className="border p-4">
      <AIDashboard/>
    </div>
    <div className="border p-4">Cell 4</div>
  </div>
</div>


    );
}
export default DashboardBody;