import React, { useState, useEffect } from 'react';
import Header from "../../TopHeader/Header/Header";
import { motion, AnimatePresence } from 'framer-motion'; // <-- Import animation components
import './MedicationsPage.css';
import CareRecipientList from '../CareRecipientList/CareRecipientList';
import MedicationLogging from '../MedicationLogging/MedicationLogging';
import MedicationDetails from '../MedicationDetails/MedicationDetails';
import MedicationForm from '../MedicationForm/MedicationForm';
import medicationScannerService from '../services/medicationScannerService';

function MedicationsPage() {
    const [careRecipients, setCareRecipients] = useState([]);
    const [selectedRecipientId, setSelectedRecipientId] = useState(null);
    const [selectedMedicationId, setSelectedMedicationId] = useState(null);
    const [mode, setMode] = useState('view'); // 'view', 'edit', 'create'
    const [capturedFile, setCapturedFile] = useState(null); // For camera capture functionality
    const [isAddingRecipient, setIsAddingRecipient] = useState(false);
    const [newRecipientName, setNewRecipientName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Remove hardcoded user ID - let backend handle authentication via JWT
    // const userId = '507f1f77bcf86cd799439011';

    const selectedRecipient = careRecipients.find(r => r.id === selectedRecipientId);
    const selectedMedication = selectedRecipient?.medications.find(m => m.id === selectedMedicationId);

    // Load care recipients from scanner database on component mount
    useEffect(() => {
        loadCareRecipients();
    }, []);

    const loadCareRecipients = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get care recipients from Forum API
            const recipients = await medicationScannerService.getCareRecipients();
            console.log('MedicationsPage: Received recipients:', recipients);
            
            if (recipients && Array.isArray(recipients)) {
                console.log('MedicationsPage: Processing', recipients.length, 'recipients');
                // Transform Forum API data to match frontend format
                const transformedRecipients = await Promise.all(
                    recipients.map(async (recipient) => {
                        // Get medications for each recipient
                        const medications = await medicationScannerService.getMedications(recipient._id);
                        const medicationsList = Array.isArray(medications) ? 
                            medications.map(med => ({
                                id: med._id,
                                name: med.name,
                                dosage: med.dosage,
                                usedTo: med.usedTo,
                                sideEffects: med.sideEffects,
                                warnings: med.warnings,
                                image: med.image?.url || 'https://i.imgur.com/8m2bAOr.jpeg',
                                dosages: med.dosages || [{ period: 'Morning', time: '08:00', taken: false }]
                            })) : [];

                        return {
                            id: recipient._id,
                            name: recipient.name,
                            medications: medicationsList
                        };
                    })
                );
                
                setCareRecipients(transformedRecipients);
                
                // Set first recipient as selected if any exist
                if (transformedRecipients.length > 0) {
                    setSelectedRecipientId(transformedRecipients[0].id);
                }
            } else {
                setCareRecipients([]);
            }
        } catch (error) {
            console.error('Error loading care recipients:', error);
            setError('Failed to load care recipients');
            setCareRecipients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMedicationSelect = (medicationId) => {
        setSelectedMedicationId(medicationId);
        setMode('view');
        setCapturedFile(null);
    };
    
    const handleAddRecipientClick = () => {
        setIsAddingRecipient(true);
        setSelectedMedicationId(null); // Clear selected medication instead
    };

    const handleSaveNewRecipient = async () => {
        if (!newRecipientName.trim()) return; // Don't save if the name is empty
        
        try {
            const recipientData = {
                name: newRecipientName
                // userId removed - let backend handle authentication via JWT
            };
            const newRecipient = await medicationScannerService.createCareRecipient(recipientData);
            
            // Reload the care recipients from the database
            await loadCareRecipients();
            
            setIsAddingRecipient(false);
            setNewRecipientName("");
            
            // Set the newly created recipient as selected
            setSelectedRecipientId(newRecipient.id);
        } catch (error) {
            console.error('Failed to save new care recipient:', error);
            alert('Failed to save new care recipient. Please try again.');
        }
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
    
    const handleSave = async (medData) => {
        console.log("Saving medication data:", medData);
        
        try {
            // Create the medication data for saving to the database
            const medicationData = {
                name: medData.name,
                dosage: medData.dosage || '',
                schedule: medData.schedule || '',
                usedTo: medData.usedTo || '',
                sideEffects: medData.sideEffects || '',
                warnings: medData.warnings || '',
                image: medData.image || 'https://i.imgur.com/8m2bAOr.jpeg',
                careRecipientId: selectedRecipientId,
                // Use dosages array from the form data, or convert schedule for compatibility
                dosages: medData.dosages && medData.dosages.length > 0 ? 
                    medData.dosages : 
                    (medData.schedule ? 
                        [{ time: medData.schedule, taken: false }] : 
                        [{ time: 'As prescribed', taken: false }])
            };

            if (mode === 'create') {
                // Check if we have a captured file from scanning
                if (capturedFile) {
                    // Save medication with image file (from scanning)
                    await medicationScannerService.scanAndSaveMedication(
                        capturedFile, 
                        selectedRecipientId
                        // userId removed - let backend handle authentication via JWT
                    );
                } else {
                    // Save medication without scanning (manual entry)
                    await medicationScannerService.createMedication(medicationData);
                }
            } else {
                // For editing existing medications, use update endpoint
                await medicationScannerService.updateMedication(selectedMedication.id, medicationData);
            }

            // Reload care recipients and medications from the database
            await loadCareRecipients();
            
            setMode('view');
            setCapturedFile(null);
        } catch (error) {
            console.error('Failed to save medication:', error);
            alert('Failed to save medication. Please try again.');
        }
    };

    const handleDeleteCareRecipient = async (recipientId) => {
        if (!recipientId) return;
        
        // Confirm deletion
        const recipient = careRecipients.find(r => r.id === recipientId);
        if (!recipient) return;
        
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${recipient.name}" and all their medications? This action cannot be undone.`
        );
        
        if (!confirmDelete) return;
        
        try {
            // Delete from database using scanner service
            await medicationScannerService.deleteCareRecipient(recipientId);
            
            // Reload care recipients from database to reflect changes
            await loadCareRecipients();
            
            // Clear selections since recipient is deleted
            setSelectedRecipientId(null);
            setSelectedMedicationId(null);
            setMode('view');
            
            console.log(`Care recipient "${recipient.name}" and all medications deleted successfully`);
        } catch (error) {
            console.error('Failed to delete care recipient:', error);
            alert('Failed to delete care recipient. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!selectedMedication) return;
        
        try {
            // Delete from database using scanner service
            await medicationScannerService.deleteMedication(selectedMedication.id);
            
            // Reload care recipients from database to reflect changes
            await loadCareRecipients();
            
            // Clear selection since medication is deleted
            setSelectedMedicationId(null);
            setMode('view');
            
            console.log(`Medication "${selectedMedication.name}" deleted successfully`);
        } catch (error) {
            console.error('Failed to delete medication:', error);
            alert('Failed to delete medication. Please try again.');
        }
    };

    const handleMedicationToggle = async (medicationId, dosageIndex) => {
        const updatedRecipients = careRecipients.map(recipient => {
            if (recipient.id === selectedRecipientId) {
                const updatedMedications = recipient.medications.map(med => {
                    if (med.id === medicationId) {
                        const updatedDosages = med.dosages.map((dosage, index) => 
                            index === dosageIndex ? { ...dosage, taken: !dosage.taken } : dosage
                        );

                        medicationScannerService.updateMedication(med.id, { dosages: updatedDosages });

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
                        onSelect={(recipientId) => setSelectedRecipientId(recipientId)}
                        onDelete={handleDeleteCareRecipient}
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
                        onToggleDose={handleMedicationToggle}
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
                            selectedRecipient={selectedRecipient}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default MedicationsPage;
