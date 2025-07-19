import React, { useState } from 'react';
import './MedicationsPage.css';
import CareRecipientList from '../CareRecipientList/CareRecipientList';
import MedicationLogging from '../MedicationLogging/MedicationLogging';
import MedicationDetails from '../MedicationDetails/MedicationDetails';
import MedicationForm from '../MedicationForm/MedicationForm';

// --- DUMMY DATA ---
const careRecipientsData = [
    {
        id: 1, name: 'James Tan', medications: [
            { id: 'med1', name: 'Metformin XR 500mg', dosages: [{ time: '1st pill @ 10am', taken: true }, { time: '2nd pill @ 12pm', taken: false }, { time: '3rd pill @ 6pm', taken: true }], usedTo: 'Manages Type 2 Diabetes Mellitus.', sideEffects: 'May cause Drowsiness', image: 'https://i.imgur.com/8m2bAOr.jpeg' },
            { id: 'med2', name: 'Glucosamine Sulfate 500 mg', dosages: [{ time: '1st pill @ 10am', taken: true }], usedTo: 'Treats osteoarthritis.', sideEffects: 'Nausea, heartburn.', image: 'https://i.imgur.com/8m2bAOr.jpeg' },
            { id: 'med3', name: 'Gliclazide (Diamicron) 30 mg', dosages: [{ time: '1st pill @ 10am', taken: true }, { time: '2nd pill @ 12pm', taken: false }, { time: '3rd pill @ 6pm', taken: false }, { time: '4th pill @ 10pm', taken: false }], usedTo: 'Controls blood sugar.', sideEffects: 'Hypoglycemia.', image: 'https://i.imgur.com/8m2bAOr.jpeg' },
        ]
    },
    { id: 2, name: 'Amelia Tan', medications: [
        { id: 'med4', name: 'Aspirin 100mg', dosages: [{ time: '1st pill @ 8am', taken: false }], usedTo: 'Pain relief, blood thinner.', sideEffects: 'Upset stomach.', image: 'https://i.imgur.com/8m2bAOr.jpeg' }
    ]}
];

function MedicationsPage() {
    const [selectedRecipient, setSelectedRecipient] = useState(careRecipientsData[0]);
    const [selectedMedication, setSelectedMedication] = useState(selectedRecipient.medications[0]);
    const [mode, setMode] = useState('view');

    const handleRecipientSelect = (recipient) => {
        setSelectedRecipient(recipient);
        setSelectedMedication(recipient.medications[0] || null);
        setMode('view');
    };

    const handleSelectMedication = (med) => {
        setSelectedMedication(med);
        setMode('view');
    };
    
    const handleAddNewClick = () => {
        setSelectedMedication(null);
        setMode('create');
    };
    
    const handleEditClick = () => {
        setMode('edit');
    };
    
    const handleCancel = () => {
        if (mode === 'create') {
            setSelectedMedication(selectedRecipient.medications[0]);
        }
        setMode('view');
    };
    
    const handleSave = (medData) => {
        console.log("Saving medication data:", medData);
        setMode('view');
    };
    
    return (
        <div className="medications-grid-layout">
            <div className="grid-item-recipients">
                <CareRecipientList 
                    recipients={careRecipientsData}
                    onSelect={handleRecipientSelect}
                    selectedRecipientId={selectedRecipient.id}
                />
            </div>
            <div className="grid-item-title">
                <h1 className="page-title">
                    Medications for <span className="recipient-name">{selectedRecipient.name.toUpperCase()}</span>
                </h1>
            </div>

            <div className="grid-item-logging">
                <MedicationLogging
                    medications={selectedRecipient.medications}
                    onSelect={handleSelectMedication} // Use the correct handler function
                    selectedMedicationId={selectedMedication ? selectedMedication.id : null}
                    onAddNew={handleAddNewClick} // Pass the add new handler
                />
            </div>
            <div className="grid-item-details">
                {/* This logic will now correctly switch between components */}
                {mode === 'view' ? (
                    <MedicationDetails 
                        medication={selectedMedication} 
                        onEdit={handleEditClick} // Pass the edit handler
                    />
                ) : (
                    <MedicationForm 
                        medication={selectedMedication} 
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </div>
    );
}

export default MedicationsPage;