import "./TabBar.css";
import DashboardIcon from "../../assets/Home.png";
import ForumIcon from "../../assets/Communication.png";
import MedicationIcon from "../../assets/Pill.png";
import BotIcon from "../../assets/Bot.png";
import ProfileIcon from "../../assets/User.png";
import { useNavigate } from "react-router-dom";
function TabBar() {
	const navigate = useNavigate();


  return (
    <div className="icons">
          					<div className="navigateTo" onClick={() => navigate("/dashboard")}>
            						<img className="applicationIcon" alt="" src={DashboardIcon}/>
            						<div className="dashboard">Dashboard</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/forum")}>
            						<img className="applicationIcon" alt="" src={ForumIcon} />
            						<div className="dashboard">Forum</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/medication")}>
            						<img className="applicationIcon" alt="" src={MedicationIcon} />
            						<div className="dashboard">Medication</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/chatbot")}>
            						<img className="applicationIcon" alt="" src={BotIcon} />
            						<div className="dashboard">Chatbot</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/profile")}>
            						<img className="applicationIcon" alt="" src={ProfileIcon} />
            						<div className="dashboard">Profile</div>
          					</div>
    </div>
   
  )
}

export default TabBar
