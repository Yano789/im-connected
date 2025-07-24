import React, { useState } from 'react';
import Header from "../../TopHeader/Header/Header";
import { motion, AnimatePresence } from 'framer-motion'; // <-- Import animation components
import './MedicationsPage.css';
import CareRecipientList from '../CareRecipientList/CareRecipientList';
import MedicationLogging from '../MedicationLogging/MedicationLogging';
import MedicationDetails from '../MedicationDetails/MedicationDetails';
import MedicationForm from '../MedicationForm/MedicationForm';

// ---- Dummy Data ----
// New format lol
const initialCareRecipientsData = [
    {
        id: 1, name: 'James Tan', medications: [
            { 
                id: 'med1', 
                name: 'Metformin XR 500mg', 
                dosages: [
                    { period: 'Morning', time: '10:00', taken: true },
                    { period: 'Afternoon', time: '12:00', taken: false },
                    { period: 'Evening', time: '18:00', taken: true }
                ], 
                usedTo: 'Manages Type 2 Diabetes Mellitus.', 
                sideEffects: 'May cause Drowsiness', 
                image: 'https://i.imgur.com/8m2bAOr.jpeg' 
            },
            { 
                id: 'med2', 
                name: 'Glucosamine Sulfate 500 mg', 
                dosages: [
                    { period: 'Morning', time: '10:00', taken: true }
                ], 
                usedTo: 'Treats osteoarthritis.', 
                sideEffects: 'Nausea, heartburn.', 
                image: 'https://i.imgur.com/8m2bAOr.jpeg' 
            },
            { 
                id: 'med3', 
                name: 'Gliclazide (Diamicron) 30 mg', 
                dosages: [
                    { period: 'Morning', time: '10:00', taken: true },
                    { period: 'Afternoon', time: '12:00', taken: false },
                    { period: 'Evening', time: '18:00', taken: false },
                    { period: 'Night', time: '22:00', taken: false }
                ], 
                usedTo: 'Controls blood sugar.', 
                sideEffects: 'Hypoglycemia.', 
                image: 'https://i.imgur.com/8m2bAOr.jpeg' 
            },
        ]
    },
    {
        id: 2, name: 'Mary Zhang', medications: [
            { 
                id: 'med4', 
                name: 'Lisinopril 5mg', 
                dosages: [
                    { period: 'Morning', time: '08:00', taken: true }
                ], 
                usedTo: 'Treats high blood pressure', 
                sideEffects: 'Cough, dizziness', 
                image: 'https://i.imgur.com/8m2bAOr.jpeg' 
            }
        ]
    }
];

function MedicationsPage() {
    const [careRecipients, setCareRecipients] = useState(initialCareRecipientsData);
    const [selectedRecipientId, setSelectedRecipientId] = useState(initialCareRecipientsData[0]?.id);
    const [selectedMedicationId, setSelectedMedicationId] = useState(null);
    const [mode, setMode] = useState('view'); // 'view', 'edit', 'create'
    const [capturedFile, setCapturedFile] = useState(null); // For camera capture functionality
    const [isAddingRecipient, setIsAddingRecipient] = useState(false);
    const [newRecipientName, setNewRecipientName] = useState("");

    const selectedRecipient = careRecipients.find(r => r.id === selectedRecipientId);
    const selectedMedication = selectedRecipient?.medications.find(m => m.id === selectedMedicationId);

    const handleMedicationSelect = (medicationId) => {
        setSelectedMedicationId(medicationId);
        setMode('view');
        setCapturedFile(null);
    };
    
    const handleAddRecipientClick = () => {
        setIsAddingRecipient(true);
        setSelectedMedication(null);
    };

    const handleSaveNewRecipient = () => {
        if (!newRecipientName.trim()) return; // Don't save if the name is empty
        const newRecipient = {
            id: `recipient_${Date.now()}`,
            name: newRecipientName,
            medications: []
        };
        setCareRecipients(prev => [...prev, newRecipient]);
        
        setIsAddingRecipient(false);
        setNewRecipientName("");
        
        setSelectedRecipientId(newRecipient.id);
    };

    const handleAddNewClick = (capturedFile = null) => {
        setSelectedMedicationId(null);
        setMode('create');
        setCapturedFile(capturedFile);
        
        console.log('Adding new medication with captured file:', capturedFile);
    };
    
    const handleEditClick = () => {
        setMode('edit');
    };
    
    const handleCancel = () => {
        if (mode === 'create') {
            setSelectedMedicationId(selectedRecipient?.medications[0]?.id || null);
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
            // Use dosages array from the form data, or convert schedule for compatibility
            dosages: medData.dosages && medData.dosages.length > 0 ? 
                medData.dosages : 
                (medData.schedule ? 
                    [{ time: medData.schedule, taken: false }] : 
                    [{ time: 'As prescribed', taken: false }])
        };

        let updatedRecipients;
        if (mode === 'create') {
            // Add new medication to the selected recipient
            updatedRecipients = careRecipients.map(recipient => {
                if (recipient.id === selectedRecipientId) {
                    return { ...recipient, medications: [...recipient.medications, newMedication] };
                }
                return recipient;
            });
            setSelectedMedicationId(newMedication.id);
        } else {
            // Update existing medication
            updatedRecipients = careRecipients.map(recipient => {
                if (recipient.id === selectedRecipientId) {
                    const newMedications = recipient.medications.map(med => 
                        med.id === selectedMedication.id ? { ...med, ...newMedication } : med
                    );
                    return { ...recipient, medications: newMedications };
                }
                return recipient;
            });
        }
        
        setCareRecipients(updatedRecipients);
        setMode('view');
        setCapturedFile(null);
    };

    const handleDelete = () => {
        if (!selectedMedication) return;
        
        const updatedRecipients = careRecipients.map(recipient => {
            if (recipient.id === selectedRecipientId) {
                const filteredMedications = recipient.medications.filter(med => med.id !== selectedMedication.id);
                return { ...recipient, medications: filteredMedications };
            }
            return recipient;
        });
        
        setCareRecipients(updatedRecipients);
        
        // Select the first medication after deletion, or null if none exist
        const updatedRecipient = updatedRecipients.find(r => r.id === selectedRecipientId);
        setSelectedMedicationId(updatedRecipient?.medications[0]?.id || null);
        setMode('view');
    };

    const handleMedicationToggle = (medicationId, dosageIndex) => {
        const updatedRecipients = careRecipients.map(recipient => {
            if (recipient.id === selectedRecipientId) {
                const updatedMedications = recipient.medications.map(med => {
                    if (med.id === medicationId) {
                        const updatedDosages = med.dosages.map((dosage, index) => 
                            index === dosageIndex ? { ...dosage, taken: !dosage.taken } : dosage
                        );
                        return { ...med, dosages: updatedDosages };
                    }
                    return med;
                });
                return { ...recipient, medications: updatedMedications };
            }
            return recipient;
        });
        setCareRecipients(updatedRecipients);
    };

    return (
        <>
            <Header />
            <div className="medications-grid-layout">
                <div className="grid-item-recipients">
                    <CareRecipientList 
                        recipients={careRecipients}
                        selectedRecipientId={selectedRecipientId}
                        onSelect={(recipientId) => {
                            setSelectedRecipientId(recipientId);
                            setSelectedMedicationId(null); // Clear medication selection when changing recipients
                            setMode('view');
                        }}
                        isAdding={isAddingRecipient}
                        newName={newRecipientName}
                        setNewName={setNewRecipientName}
                        onAdd={handleAddRecipientClick}
                        onSaveNew={handleSaveNewRecipient}
                        onCancel={() => setIsAddingRecipient(false)}
                    />
                </div>

                <div className="grid-item-logging">
                    <MedicationLogging 
                        medications={selectedRecipient?.medications || []}
                        onSelect={handleMedicationSelect}
                        selectedMedicationId={selectedMedicationId}
                        onAddNew={handleAddNewClick}
                    />
                </div>

                <div className="grid-item-details">
                    {mode === 'view' ? (
                        selectedMedication ? (
                            <MedicationDetails 
                                medication={selectedMedication} 
                                onEdit={handleEditClick}
                            />
                        ) : (
                            <div className="no-medication-selected">
                                <p>Select a medication to view details, or add a new one</p>
                            </div>
                        )
                    ) : (
                        <MedicationForm 
                            medication={selectedMedication} 
                            onSave={handleSave}
                            onCancel={handleCancel}
                            onDelete={handleDelete}
                            capturedFile={capturedFile}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default MedicationsPage;
