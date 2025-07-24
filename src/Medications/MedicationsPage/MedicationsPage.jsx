import React, { useState } from 'react';
import './MedicationsPage.css';
import Header from '../../TopHeader/Header/Header';
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
    const [capturedFile, setCapturedFile] = useState(null);

    const handleRecipientSelect = (recipient) => {
        setSelectedRecipient(recipient);
        setSelectedMedication(recipient.medications[0] || null);
        setMode('view');
        setCapturedFile(null);
    };

    const handleSelectMedication = (med) => {
        setSelectedMedication(med);
        setMode('view');
        setCapturedFile(null);
    };
    
    const handleAddNewClick = (capturedFile = null) => {
        setSelectedMedication(null);
        setMode('create');
        setCapturedFile(capturedFile);
        
        console.log('Adding new medication with captured file:', capturedFile);
    };
    
    const handleEditClick = () => {
        setMode('edit');
    };
    
    const handleCancel = () => {
        if (mode === 'create') {
            setSelectedMedication(selectedRecipient.medications[0]);
        }
        setMode('view');
        setCapturedFile(null);
    };
    
    const handleSave = (medData) => {
        console.log("Saving medication data:", medData);
        
        // Create a new medication object with enhanced data structure
        const newMedication = {
            id: selectedMedication?.id || `med${Date.now()}`,
            name: medData.name,
            dosage: medData.dosage || '',
            schedule: medData.schedule || '',
            usedTo: medData.usedTo || '',
            sideEffects: medData.sideEffects || '',
            warnings: medData.warnings || '',
            image: medData.image || 'https://i.imgur.com/8m2bAOr.jpeg',
            // Convert schedule to dosages array for compatibility with existing structure
            dosages: medData.schedule ? 
                [{ time: medData.schedule, taken: false }] : 
                [{ time: 'As prescribed', taken: false }]
        };

        // TODO: Here you would normally save to a database or API
        // For now, we'll just update the local state
        if (mode === 'create') {
            // Add new medication to the selected recipient
            const updatedRecipient = {
                ...selectedRecipient,
                medications: [...selectedRecipient.medications, newMedication]
            };
            setSelectedRecipient(updatedRecipient);
            setSelectedMedication(newMedication);
        } else {
            // Update existing medication
            const updatedMedications = selectedRecipient.medications.map(med =>
                med.id === selectedMedication.id ? { ...med, ...newMedication } : med
            );
            const updatedRecipient = {
                ...selectedRecipient,
                medications: updatedMedications
            };
            setSelectedRecipient(updatedRecipient);
            setSelectedMedication(newMedication);
        }
        
        setMode('view');
    };
    
    return (
        <div>
            <Header/>
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
                        onSelect={handleSelectMedication} 
                        selectedMedicationId={selectedMedication ? selectedMedication.id : null}
                        onAddNew={handleAddNewClick}
                    />
                </div>
                <div className="grid-item-details">
                    {mode === 'view' ? (
                        <MedicationDetails 
                            medication={selectedMedication} 
                            onEdit={handleEditClick}
                        />
                    ) : (
                        <MedicationForm 
                            medication={selectedMedication} 
                            onSave={handleSave}
                            onCancel={handleCancel}
                            capturedFile={capturedFile}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default MedicationsPage;