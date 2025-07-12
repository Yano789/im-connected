import "./MedDashboard.css";
import MedDashboardEntry from "../MedDashboardEntry/MedDashboardEntry";

function MedDashboard(){
  	
  	
  	return (
    		<div className="card">
				<p className="card-header">Medicine Logger</p>
      			<p className="card-subheader">Has your care recipient taken:</p>
      			<MedDashboardEntry medicineName="Metformin XR 500mg" medicineDosage="1st pill @ 6pm" medicineStatus="Not yet"></MedDashboardEntry>
                <MedDashboardEntry medicineName="Glucosamine Sulfate 500 mg" medicineDosage="2nd pill @ 6pm" medicineStatus="Not yet"></MedDashboardEntry>
                <MedDashboardEntry medicineName="Gliclazide (Diamicron) 30 mg" medicineDosage="1st pill @ 10am" medicineStatus="taken"></MedDashboardEntry>
    		</div>
            );
};

export default MedDashboard;
