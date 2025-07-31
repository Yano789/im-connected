import "./TabBar.css";
import DashboardIcon from "../../assets/Home.png";
import ForumIcon from "../../assets/Communication.png";
import MedicationIcon from "../../assets/Pill.png";
import BotIcon from "../../assets/Bot.png";
import ProfileIcon from "../../assets/User.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
function TabBar() {
	const navigate = useNavigate();
	const {t} = useTranslation();


  return (
    <div className="icons">
          					<div className="navigateTo" onClick={() => navigate("/dashboard")}>
            						<img className="applicationIcon" alt="" src={DashboardIcon}/>
            						<div className="dashboard">{t("Dashboard")}</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/forum")}>
            						<img className="applicationIcon" alt="" src={ForumIcon} />
            						<div className="dashboard">{t("Forum")}</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/medication")}>
            						<img className="applicationIcon" alt="" src={MedicationIcon} />
            						<div className="dashboard">{t("Medication")}</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/chatbot")}>
            						<img className="applicationIcon" alt="" src={BotIcon} />
            						<div className="dashboard">{t("Chatbot")}</div>
          					</div>
          					<div className="navigateTo" onClick={() => navigate("/profile")}>
            						<img className="applicationIcon" alt="" src={ProfileIcon} />
            						<div className="dashboard">{t("Profile")}</div>
          					</div>
    </div>
   
  )
}

export default TabBar
