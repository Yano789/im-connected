import React, { useState, useEffect } from 'react';
import './MedicationForm.css';

const getPeriodFromTime = (time) => {
    if (!time) return 'Morning';
    const hour = parseInt(time.split(':')[0], 10);
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
};


function MedicationForm({ medication, onSave, onCancel, onDelete }) {
    const isEditing = medication !== null;

    const [formData, setFormData] = useState({
        name: isEditing ? medication.name : '',
        usedTo: isEditing ? medication.usedTo : '',
        sideEffects: isEditing ? medication.sideEffects : '',
        dosages: isEditing ? JSON.parse(JSON.stringify(medication.dosages)) : [{ time: '', taken: false }],
        image: isEditing ? medication.image : '' 
    });

    useEffect(() => {
        const isEditing = medication !== null;
        // Resets the form's internal state with the new data
        setFormData({
            name: isEditing ? medication.name : '',
            usedTo: isEditing ? medication.usedTo : '',
            sideEffects: isEditing ? medication.sideEffects : '',
            dosages: isEditing ? JSON.parse(JSON.stringify(medication.dosages)) : [{ time: '', taken: false }],
            image: isEditing ? medication.image : '' 
        });
    }, [medication]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            // Create a temporary URL for the selected image to show a preview
            const newImageUrl = URL.createObjectURL(e.target.files[0]);
            setFormData(prev => ({ ...prev, image: newImageUrl }));
        }
    };


    const handleDosageChange = (index, field, value) => {
        const newDosages = [...formData.dosages];
        newDosages[index][field] = value;
        if (field === 'time') {
            newDosages[index].period = getPeriodFromTime(value);
        }
        setFormData(prev => ({ ...prev, dosages: newDosages }));
    };

    const handleAddDosage = () => {
        setFormData(prev => ({
            ...prev,
            dosages: [...prev.dosages, { period: 'Morning', time: '09:00', taken: false }]
        }));
    };

    const handleRemoveDosage = (index) => {
        const newDosages = formData.dosages.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, dosages: newDosages }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form className="details-card form-card" onSubmit={handleSubmit}>
            <div className="form-header">
                <h2 className="medication-title">{isEditing ? 'Edit Medication' : 'Add New Medication'}</h2>
                {isEditing && (
                    <button type="button" onClick={onDelete} className="delete-button-top-right" title="Delete Medication">
                        &times;
                    </button>
                )}
            </div>

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

            <div className="form-group">
                <label>Image</label>
                <div className="image-preview-container">
                    {formData.image && <img src={formData.image} alt="Medication Preview" className="image-preview" />}
                </div>
                <label htmlFor="image-upload" className="upload-image-button">
                    {isEditing ? 'Upload New Image' : 'Upload Image'}
                </label>
                <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>

            <div className="form-group">
                <label>Dosage Times</label>
                {formData.dosages.map((dosage, index) => (
                    <div key={index} className="dosage-input-row">
                        <input
                            type="time"
                            value={dosage.time}
                            onChange={(e) => handleDosageChange(index, 'time', e.target.value)}
                        />
                        <button type="button" onClick={() => handleRemoveDosage(index)} className="remove-dosage-button">&times;</button>
                    </div>
                ))}
                <button type="button" onClick={handleAddDosage} className="add-dosage-button">+ Add Dosage</button>
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>
                <button type="submit" className="save-button">Save Medicine</button>
            </div>
        </form>
    );
}

export default MedicationForm;