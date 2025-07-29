import AIDashboardEntry from "../AIDashboardEntry/AIDashboardEntry";
import { useNavigate } from "react-router-dom";
function AIDashboard(){
	const navigate = useNavigate();
  	
  	
  	return (
    		<div className="card">
				<p className="card-header">AI Chat Companion</p>
      			<p className="card-subheader">Get emotional support, summaries, translations, and resource info</p>
      			<AIDashboardEntry itemName="I’m so happy today! Help me write this down..." onClick={() => navigate("/chatbot")}></AIDashboardEntry>
				<AIDashboardEntry itemName="Can you help me research..." onClick={() => navigate("/chatbot")}></AIDashboardEntry>
				<AIDashboardEntry  itemName="Summarise this post for me..." onClick={() => navigate("/chatbot")}></AIDashboardEntry>
    		</div>
            );
};

export default AIDashboard;