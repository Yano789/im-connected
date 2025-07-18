import React from 'react';
import './MedicationDetails.css';

function MedicationDetails({ medication }) {
  // If no medication is selected, show a placeholder message
  if (!medication) {
    return (
      <div className="details-card placeholder">
        <p>Select a medication from the list to see its details.</p>
      </div>
    );
  }

  // Otherwise, show the details of the selected medication
  return (
    <div className="details-card">
      <h2 className="medication-title">{medication.name}</h2>
      
      <div className="detail-section">
        <h3 className="section-header">Schedule</h3>
        <div className="schedule-icons">
          {/* For now, we'll show static icons. This could be made dynamic later. */}
          <div className="icon-item">
            <span role="img" aria-label="Morning">☀️</span>
            Morning
          </div>
          <div className="icon-item">
            <span role="img" aria-label="Afternoon">🌤️</span>
            Afternoon
          </div>
          <div className="icon-item">
            <span role="img" aria-label="Evening">🌙</span>
            Evening
          </div>
          <div className="icon-item">
            <span role="img" aria-label="Night">🌃</span>
            Night
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3 className="section-header">Used to treat</h3>
        <p className="section-content">{medication.usedTo}</p>
      </div>

      <div className="detail-section">
        <h3 className="section-header">Side Effects</h3>
        <p className="section-content">{medication.sideEffects}</p>
      </div>
      
      <div className="detail-section">
        <h3 className="section-header">Image</h3>
        <img src={medication.image} alt={medication.name} className="medication-image" />
      </div>

      <button className="edit-button">Edit medicine</button>
    </div>
  );
}

export default MedicationDetails;