import React, { useState } from 'react';
import './MedicationForm.css';

function MedicationForm({ medication, onSave, onCancel }) {
    // Determine if we are editing an existing medication or creating a new one
    const isEditing = medication !== null;

    // Set up state to hold the form's data
    const [formData, setFormData] = useState({
        name: isEditing ? medication.name : '',
        usedTo: isEditing ? medication.usedTo : '',
        sideEffects: isEditing ? medication.sideEffects : '',
    });

    // A function to handle changes in any input field
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    // A function to handle the form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the page from reloading
        onSave(formData); // Send the data back to the parent component
    };

    return (
        <form className="details-card form-card" onSubmit={handleSubmit}>
            <h2 className="medication-title">{isEditing ? 'Edit Medication' : 'Add New Medication'}</h2>

            <div className="form-group">
                <label htmlFor="name">Medication Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="form-group">
                <label htmlFor="usedTo">Used to treat</label>
                <input type="text" id="usedTo" name="usedTo" value={formData.usedTo} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label htmlFor="sideEffects">Side Effects</label>
                <input type="text" id="sideEffects" name="sideEffects" value={formData.sideEffects} onChange={handleChange} />
            </div>

            {/* TODO: Add inputs for dosages and image upload later */}

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>
                <button type="submit" className="save-button">Save Medicine</button>
            </div>
        </form>
    );
}

export default MedicationForm;