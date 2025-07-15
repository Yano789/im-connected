import AIDashboardEntry from "../AIDashboardEntry/AIDashboardEntry";
function AIDashboard(){
  	
  	
  	return (
    		<div className="card">
				<p className="card-header">AI Chat Companion</p>
      			<p className="card-subheader">Get emotional support, summaries, translations, and resource info</p>
      			<AIDashboardEntry itemCat="" itemName="I’m so happy today! Help me write this down.."></AIDashboardEntry>
				<AIDashboardEntry itemCat="" itemName="Can you help me research..."></AIDashboardEntry>
				<AIDashboardEntry itemCat="" itemName="ITranslate this into Tamil..."></AIDashboardEntry>
    		</div>
            );
};

export default AIDashboard;