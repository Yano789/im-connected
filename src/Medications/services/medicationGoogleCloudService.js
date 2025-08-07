/**
 * Google Cloud Storage Service for Medication Images
 * Handles medication image uploads and management via Google Cloud Storage
 */

import { API_BASE_URL } from '../../config/api';

class MedicationGoogleCloudService {
    constructor() {
        this.baseURL = `${API_BASE_URL}/api/medications`;
    }

    /**
     * Upload medication image to Google Cloud Storage
     * @param {File} imageFile - The image file to upload
     * @returns {Promise<Object>} Upload result with URL and metadata
     */
    async uploadMedicationImage(imageFile) {
        try {
            console.log('Uploading medication image to Google Cloud Storage...');

            if (!imageFile) {
                throw new Error('No image file provided');
            }

            // Create FormData for the upload
            const formData = new FormData();
            formData.append('medicationImage', imageFile);

            const response = await fetch(`${this.baseURL}/upload-image`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Upload failed: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success || !result.data) {
                throw new Error('Invalid response format from server');
            }

            console.log('Image uploaded to Google Cloud Storage successfully:', result.data.url);
            
            return {
                url: result.data.url,
                public_id: result.data.public_id,
                type: result.data.type || 'image',
                format: result.data.format,
                bytes: result.data.bytes,
                resource_type: result.data.resource_type || 'image'
            };

        } catch (error) {
            console.error('Error uploading medication image to Google Cloud Storage:', error);
            throw error;
        }
    }

    /**
     * Delete medication image from Google Cloud Storage
     * @param {string} publicId - The public ID of the image to delete
     * @returns {Promise<Object>} Deletion result
     */
    async deleteMedicationImage(publicId) {
        try {
            console.log('Deleting medication image from Google Cloud Storage:', publicId);

            if (!publicId) {
                throw new Error('No public ID provided for deletion');
            }

            const response = await fetch(`${this.baseURL}/delete-image`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ publicId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Delete failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('Image deleted from Google Cloud Storage successfully');
            
            return result;

        } catch (error) {
            console.error('Error deleting medication image from Google Cloud Storage:', error);
            throw error;
        }
    }

    /**
     * Get signed URL for accessing an image (if needed)
     * @param {string} publicId - The public ID of the image
     * @returns {Promise<string>} Signed URL for the image
     */
    async getImageUrl(publicId) {
        try {
            if (!publicId) {
                throw new Error('No public ID provided');
            }

            // For Google Cloud Storage, the URL is typically already provided
            // But this method can be used to get a fresh signed URL if needed
            const response = await fetch(`${this.baseURL}/get-image-url`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ publicId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to get image URL: ${response.status}`);
            }

            const result = await response.json();
            return result.url;

        } catch (error) {
            console.error('Error getting image URL from Google Cloud Storage:', error);
            throw error;
        }
    }
}

// Export a singleton instance
const medicationGoogleCloudService = new MedicationGoogleCloudService();
export default medicationGoogleCloudService;
