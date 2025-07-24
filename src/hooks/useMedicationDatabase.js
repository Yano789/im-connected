import { useState, useEffect, useCallback } from 'react';
import medicationDatabaseService from '../services/medicationDatabaseService';

/**
 * Custom hook for managing medications with database persistence
 * Replaces local state management with database operations
 */
export const useMedicationDatabase = () => {
    // State management
    const [careRecipients, setCareRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // =============================================================================
    // CARE RECIPIENTS MANAGEMENT
    // =============================================================================

    /**
     * Load all care recipients from database
     */
    const loadCareRecipients = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await medicationDatabaseService.getCareRecipients();
            setCareRecipients(response.data || []);
            
            // Auto-select first recipient if none selected
            if (!selectedRecipient && response.data && response.data.length > 0) {
                setSelectedRecipient(response.data[0]);
            }
        } catch (err) {
            console.error('Failed to load care recipients:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedRecipient]);

    /**
     * Create a new care recipient
     * @param {Object} recipientData - Care recipient information
     */
    const createCareRecipient = useCallback(async (recipientData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await medicationDatabaseService.createCareRecipient(recipientData);
            
            // Add to local state
            setCareRecipients(prev => [response.data, ...prev]);
            
            // Auto-select if it's the first recipient
            if (!selectedRecipient) {
                setSelectedRecipient(response.data);
            }
            
            return response.data;
        } catch (err) {
            console.error('Failed to create care recipient:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedRecipient]);

    /**
     * Update an existing care recipient
     * @param {string} id - Care recipient ID
     * @param {Object} updateData - Updated information
     */
    const updateCareRecipient = useCallback(async (id, updateData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await medicationDatabaseService.updateCareRecipient(id, updateData);
            
            // Update local state
            setCareRecipients(prev => 
                prev.map(recipient => 
                    recipient._id === id ? response.data : recipient
                )
            );
            
            // Update selected recipient if it's the one being updated
            if (selectedRecipient && selectedRecipient._id === id) {
                setSelectedRecipient(response.data);
            }
            
            return response.data;
        } catch (err) {
            console.error('Failed to update care recipient:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedRecipient]);

    /**
     * Delete a care recipient
     * @param {string} id - Care recipient ID
     */
    const deleteCareRecipient = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        
        try {
            await medicationDatabaseService.deleteCareRecipient(id);
            
            // Remove from local state
            setCareRecipients(prev => prev.filter(recipient => recipient._id !== id));
            
            // Clear selection if deleted recipient was selected
            if (selectedRecipient && selectedRecipient._id === id) {
                setSelectedRecipient(null);
                setMedications([]); // Clear medications for deleted recipient
            }
        } catch (err) {
            console.error('Failed to delete care recipient:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedRecipient]);

    // =============================================================================
    // MEDICATIONS MANAGEMENT
    // =============================================================================

    /**
     * Load medications for the selected care recipient
     */
    const loadMedications = useCallback(async (recipientId = null) => {
        const targetRecipientId = recipientId || selectedRecipient?._id;
        
        if (!targetRecipientId) {
            setMedications([]);
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await medicationDatabaseService.getMedicationsForRecipient(targetRecipientId);
            setMedications(response.data || []);
        } catch (err) {
            console.error('Failed to load medications:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedRecipient]);

    /**
     * Create a new medication
     * @param {Object} medicationData - Medication information
     */
    const createMedication = useCallback(async (medicationData) => {
        if (!selectedRecipient) {
            throw new Error('No care recipient selected');
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await medicationDatabaseService.createMedication(
                selectedRecipient._id, 
                medicationData
            );
            
            // Add to local state
            setMedications(prev => [response.data, ...prev]);
            
            return response.data;
        } catch (err) {
            console.error('Failed to create medication:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedRecipient]);

    /**
     * Update an existing medication
     * @param {string} medicationId - Medication ID
     * @param {Object} updateData - Updated information
     */
    const updateMedication = useCallback(async (medicationId, updateData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await medicationDatabaseService.updateMedication(medicationId, updateData);
            
            // Update local state
            setMedications(prev => 
                prev.map(med => 
                    med._id === medicationId ? response.data : med
                )
            );
            
            return response.data;
        } catch (err) {
            console.error('Failed to update medication:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete a medication
     * @param {string} medicationId - Medication ID
     */
    const deleteMedication = useCallback(async (medicationId) => {
        setLoading(true);
        setError(null);
        
        try {
            await medicationDatabaseService.deleteMedication(medicationId);
            
            // Remove from local state
            setMedications(prev => prev.filter(med => med._id !== medicationId));
        } catch (err) {
            console.error('Failed to delete medication:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // =============================================================================
    // MEDICATION LOGGING
    // =============================================================================

    /**
     * Log medication dosage (taken/not taken)
     * @param {string} medicationId - Medication ID
     * @param {Object} logData - Log information
     */
    const logMedicationDosage = useCallback(async (medicationId, logData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await medicationDatabaseService.logMedicationDosage(medicationId, logData);
            
            // Reload medications to get updated status
            await loadMedications();
            
            return response.data;
        } catch (err) {
            console.error('Failed to log medication dosage:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadMedications]);

    // =============================================================================
    // IMAGE MANAGEMENT
    // =============================================================================

    /**
     * Upload medication image
     * @param {File} imageFile - Image file
     * @param {string} medicationId - Optional medication ID
     */
    const uploadMedicationImage = useCallback(async (imageFile, medicationId = null) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await medicationDatabaseService.uploadMedicationImage(imageFile, medicationId);
            
            // If associated with a medication, reload medications to show updated images
            if (medicationId) {
                await loadMedications();
            }
            
            return response.data;
        } catch (err) {
            console.error('Failed to upload medication image:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadMedications]);

    /**
     * Delete medication image
     * @param {string} publicId - Cloudinary public ID
     * @param {string} medicationId - Optional medication ID
     */
    const deleteMedicationImage = useCallback(async (publicId, medicationId = null) => {
        setLoading(true);
        setError(null);
        
        try {
            await medicationDatabaseService.deleteMedicationImage(publicId, medicationId);
            
            // If associated with a medication, reload medications to show updated images
            if (medicationId) {
                await loadMedications();
            }
        } catch (err) {
            console.error('Failed to delete medication image:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadMedications]);

    // =============================================================================
    // EFFECTS AND INITIALIZATION
    // =============================================================================

    // Load care recipients on mount
    useEffect(() => {
        loadCareRecipients();
    }, [loadCareRecipients]);

    // Load medications when selected recipient changes
    useEffect(() => {
        if (selectedRecipient) {
            loadMedications();
        } else {
            setMedications([]);
        }
    }, [selectedRecipient, loadMedications]);

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Select a care recipient
     * @param {Object} recipient - Care recipient to select
     */
    const selectRecipient = useCallback((recipient) => {
        setSelectedRecipient(recipient);
    }, []);

    /**
     * Get analytics for the selected recipient
     * @param {Object} options - Date range options
     */
    const getAnalytics = useCallback(async (options = {}) => {
        if (!selectedRecipient) {
            throw new Error('No care recipient selected');
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await medicationDatabaseService.getAnalytics(selectedRecipient._id, options);
            return response.data;
        } catch (err) {
            console.error('Failed to get analytics:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedRecipient]);

    // =============================================================================
    // RETURN HOOK INTERFACE
    // =============================================================================

    return {
        // State
        careRecipients,
        selectedRecipient,
        medications,
        loading,
        error,

        // Care Recipients Methods
        loadCareRecipients,
        createCareRecipient,
        updateCareRecipient,
        deleteCareRecipient,
        selectRecipient,

        // Medications Methods
        loadMedications,
        createMedication,
        updateMedication,
        deleteMedication,

        // Logging Methods
        logMedicationDosage,

        // Image Methods
        uploadMedicationImage,
        deleteMedicationImage,

        // Analytics
        getAnalytics,

        // Utilities
        clearError,
    };
};

export default useMedicationDatabase;
