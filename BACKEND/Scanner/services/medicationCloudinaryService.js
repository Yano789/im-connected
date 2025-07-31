/**
 * Medication Cloudinary Service
 * Handles uploading medication images to Cloudinary (same as forum)
 */

const FORUM_API_BASE_URL = 'http://localhost:5001';

class MedicationCloudinaryService {
  /**
   * Upload medication image directly to Cloudinary using a dedicated endpoint
   * @param {File} imageFile - The image file to upload
   * @returns {Promise<Object>} - Upload result with image URL and public_id
   */
  async uploadMedicationImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('medicationImage', imageFile);
      
      // Use the dedicated medication endpoint
      const response = await fetch(`${FORUM_API_BASE_URL}/api/v1/medication/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload medication image');
      }

      const result = await response.json();
      return result.data; // Return the upload data
    } catch (error) {
      console.error('Error uploading medication image:', error);
      throw error;
    }
  }

  /**
   * Delete a medication image from Cloudinary
   * @param {string} publicId - The public_id of the image to delete
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteMedicationImage(publicId) {
    try {
      const response = await fetch(`${FORUM_API_BASE_URL}/api/v1/medication/delete-image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_id: publicId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete medication image');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error deleting medication image:', error);
      throw error;
    }
  }

  /**
   * Check if the medication upload service is available
   * @returns {Promise<boolean>} - True if service is available
   */
  async checkServiceHealth() {
    try {
      const response = await fetch(`${FORUM_API_BASE_URL}/api/v1/medication/health`);
      return response.ok;
    } catch (error) {
      console.error('Medication upload service not available:', error);
      return false;
    }
  }
}

const medicationCloudinaryService = new MedicationCloudinaryService();
export default medicationCloudinaryService;
