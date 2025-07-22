import React from 'react';
import './MedicationLogging.css';
import MedicationItem from '../MedicationItem/MedicationItem';

function MedicationLogging({ medications, onSelect, selectedMedicationId, onAddNew }) {
    const isAddingNew = !selectedMedicationId;
    
    return (
        <div className="card logging-card">
            <h2 className="card-header">Medication Logging</h2>
            <p className="sub-header">Has your care recipient taken:</p>

            <div className="medication-list">
                {medications.map((med) => (
                    <MedicationItem 
                        key={med.id}
                        medication={med}
                        onSelect={onSelect}
                        isSelected={selectedMedicationId === med.id}
                    />
                ))}
            </div>

            <button className={isAddingNew ? "add-medication-button selected" : "add-medication-button"} onClick={onAddNew}>
                <div className="add-icon">+</div>
                <span>Add more medication</span>
            </button>
            
            <div className="action-buttons">
                <button className="upload-button">Upload Image</button>
                <button className="camera-button">Use Camera</button>
            </div>
        </div>
    );
}

export default MedicationLogging;