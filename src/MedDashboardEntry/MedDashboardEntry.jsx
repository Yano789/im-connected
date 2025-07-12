import "./MedDashboardEntry.css";

function MedDashboardEntry(props){
    const medicineName = props.medicineName;
    const medicineDosage = props.medicineDosage;
    const medicineStatus = props.medicineStatus;

  	return (
            <div className="div">
      			<div className="items">
        				<div className="medicineName">{medicineName}</div>
        				<div className="medicineDosage">{medicineDosage}</div>
        				<div className="medicineStatus">{medicineStatus}</div>
      			</div>
      			<hr className="line"></hr>
            </div>
    );
};

export default MedDashboardEntry;