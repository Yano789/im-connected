import React from 'react';
import './MedicationItem.css';
import { useTranslation } from 'react-i18next';

function MedicationItem({ medication, onSelect, isSelected, onToggleDose }) {
  const { t } = useTranslation();
  
  // Helper function to format 24-hour time to 12-hour AM/PM
  const formatTimeToAMPM = (time) => {
      if (!time) return t('No time set');
      let [hours, minutes] = time.split(':');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // The hour '0' should be '12'
      return `${hours}:${minutes} ${ampm}`;
  };
  return (
    // This wrapper creates the separator line between medication items
    <div className="medication-wrapper">
      <div 
        className={isSelected ? "med-item-layout selected" : "med-item-layout"}
      >
        <div className="med-name-container" onClick={() => onSelect(medication.id)}>
          <button className="med-name-button">{medication.name}</button>
        </div>

        <div className="dosage-list-container">
          {medication.dosages.map((dosage, index) => (
            <div key={index} className="dosage-row">
                <span>{formatTimeToAMPM(dosage.time)}</span>
              <input 
                type="checkbox" 
                className="med-checkbox" 
                defaultChecked={dosage.taken}
                onChange={() => onToggleDose(medication.id, index)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MedicationItem;