import React, { useState } from 'react';
import './MedicationsPage.css';
import CareRecipientList from '../CareRecipientList/CareRecipientList'; 
// import MedicationLogging from '../MedicationLogging/MedicationLogging';
// import MedicationDetails from '../MedicationDetails/MedicationDetails';

// --- DUMMY DATA (stays the same) ---
const careRecipientsData = [
    { id: 1, name: 'James Tan', medications: [
        { id: 'med1', name: 'Metformin XR 500mg', dosage: '1st pill @ 10am', taken: true, schedule: ['Morning'], usedTo: 'Manages Type 2 Diabetes Mellitus.', sideEffects: 'May cause Drowsiness', image: 'path/to/metformin_image.jpg' },
        { id: 'med2', name: 'Glucosamine Sulfate 500 mg', dosage: '1st pill @ 10am', taken: true, schedule: ['Morning'], usedTo: 'Treats osteoarthritis.', sideEffects: 'Nausea, heartburn.', image: 'path/to/glucosamine_image.jpg' },
        { id: 'med3', name: 'Gliclazide (Diamicron) 30 mg', dosage: '1st pill @ 10am', taken: false, schedule: ['Morning'], usedTo: 'Controls blood sugar.', sideEffects: 'Hypoglycemia.', image: 'path/to/gliclazide_image.jpg' },
    ]},
    { id: 2, name: 'Amelia Tan', medications: [
        { id: 'med4', name: 'Aspirin 100mg', dosage: '1st pill @ 8am', taken: false, schedule: ['Morning'], usedTo: 'Pain relief, blood thinner.', sideEffects: 'Upset stomach.', image: 'path/to/aspirin_image.jpg' }
    ]}
];
// ------------------------------------

function MedicationsPage() {
    const [selectedRecipient, setSelectedRecipient] = useState(careRecipientsData[0]);
    const [selectedMedication, setSelectedMedication] = useState(selectedRecipient.medications[0]);

    const handleRecipientSelect = (recipient) => {
        setSelectedRecipient(recipient);
        setSelectedMedication(recipient.medications[0] || null);
    };

    return (
        <div className="medications-grid-layout">
            {/* -- Row 1 -- */}
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

            {/* -- Row 2 -- */}
            <div className="grid-item-logging">
                {/* Placeholder for MedicationLogging */}
                <div style={{ border: '2px dashed #ccc', padding: '1rem', textAlign: 'center' }}>
                    <h3>Medication Logging</h3>
                    <p>(This is where the medications will be listed)</p>
                </div>
            </div>
            <div className="grid-item-details">
                {/* Placeholder for MedicationDetails */}
                <div style={{ border: '2px dashed #ccc', padding: '1rem', textAlign: 'center', height: '400px' }}>
                    <h3>Medication Details</h3>
                    <p>(Details will appear here)</p>
                </div>
            </div>
        </div>
    );
}

export default MedicationsPage;