// Medication Database Service - Frontend service for medication management
// This service interfaces with the Forum backend medication API

import { API_ENDPOINTS } from '../../config/api.js';

class MedicationDatabaseService {
    constructor() {
        // Use the centralized API configuration
        this.baseURL = API_ENDPOINTS.MEDICATION_BASE.replace('/medications', '') + '/medication';
    }

    // =============================================================================
    // CARE RECIPIENTS METHODS
    // =============================================================================

    /**
     * Get all care recipients for the current user
     * @returns {Promise<Object>} Response with care recipients data
     */
    async getCareRecipients() {
        try {
            const response = await fetch(`${this.baseURL}/care-recipients`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch care recipients');
            }

            return data;
        } catch (error) {
            console.error('Error fetching care recipients:', error);
            throw error;
        }
    }

    /**
     * Create a new care recipient
     * @param {Object} recipientData - Care recipient information
     * @returns {Promise<Object>} Response with created care recipient
     */
    async createCareRecipient(recipientData) {
        try {
            const response = await fetch(`${this.baseURL}/care-recipients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipientData),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create care recipient');
            }

            return data;
        } catch (error) {
            console.error('Error creating care recipient:', error);
            throw error;
        }
    }

    /**
     * Update an existing care recipient
     * @param {string} id - Care recipient ID
     * @param {Object} updateData - Updated care recipient information
     * @returns {Promise<Object>} Response with updated care recipient
     */
    async updateCareRecipient(id, updateData) {
        try {
            const response = await fetch(`${this.baseURL}/care-recipients/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update care recipient');
            }

            return data;
        } catch (error) {
            console.error('Error updating care recipient:', error);
            throw error;
        }
    }

    /**
     * Delete a care recipient (soft delete)
     * @param {string} id - Care recipient ID
     * @returns {Promise<Object>} Response confirming deletion
     */
    async deleteCareRecipient(id) {
        try {
            const response = await fetch(`${this.baseURL}/care-recipients/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete care recipient');
            }

            return data;
        } catch (error) {
            console.error('Error deleting care recipient:', error);
            throw error;
        }
    }

    // =============================================================================
    // MEDICATIONS METHODS
    // =============================================================================

    /**
     * Get all medications for a specific care recipient
     * @param {string} recipientId - Care recipient ID
     * @returns {Promise<Object>} Response with medications data
     */
    async getMedicationsForRecipient(recipientId) {
        try {
            const response = await fetch(`${this.baseURL}/care-recipients/${recipientId}/medications`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch medications');
            }

            return data;
        } catch (error) {
            console.error('Error fetching medications:', error);
            throw error;
        }
    }

    /**
     * Create a new medication for a care recipient
     * @param {string} recipientId - Care recipient ID
     * @param {Object} medicationData - Medication information
     * @returns {Promise<Object>} Response with created medication
     */
    async createMedication(recipientId, medicationData) {
        try {
            const response = await fetch(`${this.baseURL}/care-recipients/${recipientId}/medications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(medicationData),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create medication');
            }

            return data;
        } catch (error) {
            console.error('Error creating medication:', error);
            throw error;
        }
    }

    /**
     * Get a specific medication by ID
     * @param {string} medicationId - Medication ID
     * @returns {Promise<Object>} Response with medication data
     */
    async getMedication(medicationId) {
        try {
            const response = await fetch(`${this.baseURL}/medications/${medicationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch medication');
            }

            return data;
        } catch (error) {
            console.error('Error fetching medication:', error);
            throw error;
        }
    }

    /**
     * Update an existing medication
     * @param {string} medicationId - Medication ID
     * @param {Object} updateData - Updated medication information
     * @returns {Promise<Object>} Response with updated medication
     */
    async updateMedication(medicationId, updateData) {
        try {
            const response = await fetch(`${this.baseURL}/medications/${medicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update medication');
            }

            return data;
        } catch (error) {
            console.error('Error updating medication:', error);
            throw error;
        }
    }

    /**
     * Delete a medication (soft delete)
     * @param {string} medicationId - Medication ID
     * @returns {Promise<Object>} Response confirming deletion
     */
    async deleteMedication(medicationId) {
        try {
            const response = await fetch(`${this.baseURL}/medications/${medicationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete medication');
            }

            return data;
        } catch (error) {
            console.error('Error deleting medication:', error);
            throw error;
        }
    }

    // =============================================================================
    // MEDICATION LOGGING METHODS
    // =============================================================================

    /**
     * Log medication dosage (taken/not taken)
     * @param {string} medicationId - Medication ID
     * @param {Object} logData - Log information
     * @returns {Promise<Object>} Response with log entry
     */
    async logMedicationDosage(medicationId, logData) {
        try {
            const response = await fetch(`${this.baseURL}/medications/${medicationId}/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to log medication dosage');
            }

            return data;
        } catch (error) {
            console.error('Error logging medication dosage:', error);
            throw error;
        }
    }

    /**
     * Get medication logs for a specific medication
     * @param {string} medicationId - Medication ID
     * @param {Object} options - Query options (limit, offset)
     * @returns {Promise<Object>} Response with medication logs
     */
    async getMedicationLogs(medicationId, options = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (options.limit) queryParams.append('limit', options.limit);
            if (options.offset) queryParams.append('offset', options.offset);

            const url = `${this.baseURL}/medications/${medicationId}/logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch medication logs');
            }

            return data;
        } catch (error) {
            console.error('Error fetching medication logs:', error);
            throw error;
        }
    }

    // =============================================================================
    // IMAGE UPLOAD METHODS
    // =============================================================================

    /**
     * Upload medication image
     * @param {File} imageFile - Image file to upload
     * @param {string} medicationId - Optional medication ID to associate image
     * @returns {Promise<Object>} Response with image data
     */
    async uploadMedicationImage(imageFile, medicationId = null) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            if (medicationId) {
                formData.append('medicationId', medicationId);
            }

            const response = await fetch(`${this.baseURL}/upload-image`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            return data;
        } catch (error) {
            console.error('Error uploading medication image:', error);
            throw error;
        }
    }

    /**
     * Delete medication image
     * @param {string} publicId - Cloudinary public ID
     * @param {string} medicationId - Optional medication ID to remove association
     * @returns {Promise<Object>} Response confirming deletion
     */
    async deleteMedicationImage(publicId, medicationId = null) {
        try {
            const response = await fetch(`${this.baseURL}/delete-image`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    publicId,
                    medicationId
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete image');
            }

            return data;
        } catch (error) {
            console.error('Error deleting medication image:', error);
            throw error;
        }
    }

    // =============================================================================
    // ANALYTICS METHODS
    // =============================================================================

    /**
     * Get medication adherence analytics for a care recipient
     * @param {string} recipientId - Care recipient ID
     * @param {Object} options - Date range options
     * @returns {Promise<Object>} Response with analytics data
     */
    async getAnalytics(recipientId, options = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (options.startDate) queryParams.append('startDate', options.startDate);
            if (options.endDate) queryParams.append('endDate', options.endDate);

            const url = `${this.baseURL}/care-recipients/${recipientId}/analytics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch analytics');
            }

            return data;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }

    // =============================================================================
    // SCANNER INTEGRATION METHODS
    // =============================================================================

    /**
     * Scan medication image for OCR processing (preview only)
     * @param {File} imageFile - Image file to scan
     * @returns {Promise<Object>} Response with scan results
     */
    async scanMedicationImage(imageFile) {
        try {
            const formData = new FormData();
            formData.append('medicationImage', imageFile);

            // Use the scanner API directly for preview
            const response = await fetch('http://localhost:3001/scan-medication', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to scan medication image');
            }

            return data;
        } catch (error) {
            console.error('Error scanning medication image:', error);
            throw error;
        }
    }

    /**
     * Scan and save medication image to database
     * @param {File} imageFile - Image file to scan
     * @param {string} careRecipientId - Care recipient ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Response with scan results and saved medication
     */
    async scanAndSaveMedication(imageFile, careRecipientId, userId) {
        try {
            const formData = new FormData();
            formData.append('medicationImage', imageFile);
            formData.append('careRecipientId', careRecipientId);
            formData.append('userId', userId);

            // Use the scanner API's save endpoint
            const response = await fetch('http://localhost:3001/save-scanned-medication', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to scan and save medication');
            }

            return data;
        } catch (error) {
            console.error('Error scanning and saving medication:', error);
            throw error;
        }
    }

    /**
     * Get care recipients from scanner database
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Response with care recipients
     */
    async getScannerCareRecipients(userId) {
        try {
            const response = await fetch(`http://localhost:3001/care-recipients/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch care recipients from scanner');
            }

            return data;
        } catch (error) {
            console.error('Error fetching care recipients from scanner:', error);
            throw error;
        }
    }

    /**
     * Create care recipient in scanner database
     * @param {Object} recipientData - Care recipient data
     * @returns {Promise<Object>} Response with created care recipient
     */
    async createScannerCareRecipient(recipientData) {
        try {
            const response = await fetch('http://localhost:3001/care-recipients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipientData),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create care recipient in scanner');
            }

            return data;
        } catch (error) {
            console.error('Error creating care recipient in scanner:', error);
            throw error;
        }
    }

    /**
     * Get medications from scanner database
     * @param {string} careRecipientId - Care recipient ID
     * @returns {Promise<Object>} Response with medications
     */
    async getScannerMedications(careRecipientId) {
        try {
            const response = await fetch(`http://localhost:3001/medications/${careRecipientId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch medications from scanner');
            }

            return data;
        } catch (error) {
            console.error('Error fetching medications from scanner:', error);
            throw error;
        }
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    /**
     * Check if the medication service is healthy
     * @returns {Promise<Object>} Response with health status
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Health check failed');
            }

            return data;
        } catch (error) {
            console.error('Error checking service health:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const medicationDatabaseService = new MedicationDatabaseService();
export default medicationDatabaseService;
