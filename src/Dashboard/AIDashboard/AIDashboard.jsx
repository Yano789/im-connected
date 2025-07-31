import AIDashboardEntry from "../AIDashboardEntry/AIDashboardEntry";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
function AIDashboard(){
	const navigate = useNavigate();
	const {t} = useTranslation();
  	
  	
  	return (
    		<div className="cardDiv">
				<p className="card-header">{t("AIDashboardHeader")}</p>
      			<p className="card-subheader">{t("AIDashboardSubHeader")}</p>
      			<AIDashboardEntry itemName={t("AIDashboardEntry1")} onClick={() => navigate("/chatbot")}></AIDashboardEntry>
				<AIDashboardEntry itemName={t("AIDashboardEntry2")}onClick={() => navigate("/chatbot")}></AIDashboardEntry>
				<AIDashboardEntry  itemName={t("AIDashboardEntry3")} onClick={() => navigate("/chatbot")}></AIDashboardEntry>
    		</div>
            );
};

export default AIDashboard;