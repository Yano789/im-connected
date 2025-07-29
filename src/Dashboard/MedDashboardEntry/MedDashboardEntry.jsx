import "./MedDashboardEntry.css";

function MedDashboardEntry(props) {
  const medicineName = props.medicineName;
  const medicineDosage = props.medicineDosage;

  return (
    <div className="items">
      <div className="medicineName">{medicineName}</div>
      <div className="medicineDosage">{medicineDosage}</div>
    </div>
  );
}

export default MedDashboardEntry;
