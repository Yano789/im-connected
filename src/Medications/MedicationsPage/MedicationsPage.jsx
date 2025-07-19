import React, { useState } from 'react';
import Header from "../../TopHeader/Header/Header";
import './MedicationsPage.css';
import CareRecipientList from '../CareRecipientList/CareRecipientList';
import MedicationLogging from '../MedicationLogging/MedicationLogging';
import MedicationDetails from '../MedicationDetails/MedicationDetails';
import MedicationForm from '../MedicationForm/MedicationForm';

// ---- Dummy Data ----
const initialCareRecipientsData = [
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
    const [careRecipients, setCareRecipients] = useState(initialCareRecipientsData);
    const [selectedRecipientId, setSelectedRecipientId] = useState(careRecipients[0].id);
    const selectedRecipient = careRecipients.find(r => r.id === selectedRecipientId);
    const [selectedMedication, setSelectedMedication] = useState(selectedRecipient.medications[0]);
    const [mode, setMode] = useState('view');

    const handleRecipientSelect = (recipient) => {
        setSelectedRecipientId(recipient.id);
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
    
    const handleSave = (savedMedData) => {
        let updatedRecipients;
        if (mode === 'edit') {
            updatedRecipients = careRecipients.map(recipient => {
                if (recipient.id === selectedRecipientId) {
                    const newMedications = recipient.medications.map(med => med.id === selectedMedication.id ? { ...med, ...savedMedData } : med);
                    return { ...recipient, medications: newMedications };
                }
                return recipient;
            });
        } else {
            const newMedication = { ...savedMedData, id: `med_${Date.now()}` };
            updatedRecipients = careRecipients.map(recipient => {
                if (recipient.id === selectedRecipientId) {
                    return { ...recipient, medications: [...recipient.medications, newMedication] };
                }
                return recipient;
            });
        }
        setCareRecipients(updatedRecipients);
        const updatedCurrentRecipient = updatedRecipients.find(r => r.id === selectedRecipientId);
        const newlySavedMedication = mode === 'edit' ? updatedCurrentRecipient.medications.find(m => m.id === selectedMedication.id) : updatedCurrentRecipient.medications[updatedCurrentRecipient.medications.length - 1];
        setSelectedMedication(newlySavedMedication);
        setMode('view');
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedMedication.name}? This cannot be undone.`)) {
            const updatedRecipients = careRecipients.map(recipient => {
                if (recipient.id === selectedRecipientId) {
                    const newMedications = recipient.medications.filter(med => med.id !== selectedMedication.id);
                    return { ...recipient, medications: newMedications };
                }
                return recipient;
            });
            setCareRecipients(updatedRecipients);
            const updatedCurrentRecipient = updatedRecipients.find(r => r.id === selectedRecipientId);
            setSelectedMedication(updatedCurrentRecipient.medications[0] || null);
            setMode('view');
        }
    };
    
    return (
        <>
            <Header />
            <div className="medications-grid-layout">
                <div className="grid-item-recipients">
                    <CareRecipientList 
                        recipients={careRecipients} 
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
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default MedicationsPage;