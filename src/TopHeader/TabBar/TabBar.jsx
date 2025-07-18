import "./TabBar.css"
import { useNavigate } from "react-router-dom";
function TabBar() {
	const navigate = useNavigate();


  return (
    <div className="icons">
          					<div className="navigateTo" onClick={() => navigate("/dashboard")}>
            						<img className="applicationIcon" alt="" src="src\assets\Home.png" />
            						<div className="dashboard">Dashboard</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/forum")}>
            						<img className="applicationIcon" alt="" src="src\assets\Communication.png" />
            						<div className="dashboard">Forum</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/medication")}>
            						<img className="applicationIcon" alt="" src="src\assets\Pill.png" />
            						<div className="dashboard">Medication</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/chatbot")}>
            						<img className="applicationIcon" alt="" src="src\assets\Bot.png" />
            						<div className="dashboard">Chatbot</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/profile")}>
            						<img className="applicationIcon" alt="" src="src\assets\User.png" />
            						<div className="dashboard">Profile</div>
          					</div>
    </div>
   
  )
}

export default TabBar
