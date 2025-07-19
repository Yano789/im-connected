import React from 'react';
import './MedicationItem.css';

function MedicationItem({ medication, onSelect, isSelected }) {
  return (
    // This wrapper creates the separator line between medication items
    <div className="medication-wrapper">
      <div 
        className={isSelected ? "med-item-layout selected" : "med-item-layout"}
      >
        <div className="med-name-container" onClick={() => onSelect(medication)}>
          <button className="med-name-button">{medication.name}</button>
        </div>

        <div className="dosage-list-container">
          {medication.dosages.map((dosage, index) => (
            <div key={index} className="dosage-row">
              <span>{dosage.time}</span>
              <input 
                type="checkbox" 
                defaultChecked={dosage.taken} 
                className="med-checkbox" 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MedicationItem;