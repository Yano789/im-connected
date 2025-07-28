/**
 * Medication Service
 * Handles medication scanning via Scanner API and data management via Forum API
 */

const SCANNER_API_BASE_URL = 'http://localhost:3001';
const FORUM_API_BASE_URL = 'http://localhost:5001/api/v1';

class MedicationService {
  // ==================== SCANNING OPERATIONS ====================
  
  /**
   * Check if the Scanner API is available and responding
   * @returns {Promise<boolean>} - True if API is available, false otherwise
   */
  async checkApiHealth() {
    try {
      console.log('Checking Scanner API health at:', `${SCANNER_API_BASE_URL}/health`);
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${SCANNER_API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const healthData = await response.json();
        console.log('Scanner API is healthy:', healthData);
        return true;
      } else {
        console.warn('Scanner API returned non-OK status:', response.status);
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Scanner API health check timed out');
      } else {
        console.error('Scanner API health check failed:', error.message);
      }
      return false;
    }
  }
  
  /**
   * Scan a medication image and extract information
   * @param {File} imageFile - The image file to scan
   * @returns {Promise<Object>} - Scan results with medication data
   */
  async scanMedicationImage(imageFile) {
    try {
      console.log('Scanner Service: Starting scan with file:', imageFile);
      console.log('Scanner Service: File details:', {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
        lastModified: imageFile.lastModified,
        constructor: imageFile.constructor.name
      });

      const formData = new FormData();
      formData.append('medicationImage', imageFile);

      // Log FormData contents
      console.log('Scanner Service: FormData created');
      for (let [key, value] of formData.entries()) {
        console.log('Scanner Service: FormData entry:', key, value);
        if (value instanceof File) {
          console.log('Scanner Service: FormData file details:', {
            name: value.name,
            type: value.type,
            size: value.size
          });
        }
      }

      console.log('Scanner Service: Sending request to:', `${SCANNER_API_BASE_URL}/scan-medication`);

      const response = await fetch(`${SCANNER_API_BASE_URL}/scan-medication`, {
        method: 'POST',
        body: formData,
      });

      console.log('Scanner Service: Response received');
      console.log('Scanner Service: Response status:', response.status);
      console.log('Scanner Service: Response statusText:', response.statusText);
      console.log('Scanner Service: Response headers:', Object.fromEntries(response.headers.entries()));

      // Always get response text first to see what we're dealing with
      const responseText = await response.text();
      console.log('Scanner Service: Raw response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Scanner Service: Error response:', errorData);
        throw new Error(errorData.error || 'Failed to scan medication image');
      }

      const result = JSON.parse(responseText);
      console.log('Scanner Service: Success response:', result);
      return result;
    } catch (error) {
      console.error('Scanner Service: Error scanning medication:', error);
      throw error;
    }
  }

  /**
   * Check if the Scanner API is available
   * @returns {Promise<boolean>} - True if API is available
   */
  async checkScannerApiHealth() {
    try {
      const response = await fetch(`${SCANNER_API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Scanner API not available:', error);
      return false;
    }
  }

  // ==================== CARE RECIPIENTS CRUD ====================

  /**
   * Get all care recipients for the current user
   * @returns {Promise<Array>} - Array of care recipients
   */
  async getCareRecipients() {
    try {
      const response = await fetch(`${FORUM_API_BASE_URL}/medication/care-recipients`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch care recipients: ${errorText}`);
      }

      const data = await response.json();
      console.log('Scanner Service: getCareRecipients response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching care recipients:', error);
      throw error;
    }
  }

  /**
   * Create a new care recipient
   * @param {string} name - Name of the care recipient
   * @returns {Promise<Object>} - Created care recipient
   */
  async createCareRecipient(recipientData) {
    try {
      const response = await fetch(`${FORUM_API_BASE_URL}/medication/care-recipients`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipientData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create care recipient: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating care recipient:', error);
      throw error;
    }
  }

  /**
   * Update a care recipient
   * @param {string} id - Care recipient ID
   * @param {string} name - New name
   * @returns {Promise<Object>} - Updated care recipient
   */
  async updateCareRecipient(id, name) {
    try {
      const response = await fetch(`${FORUM_API_BASE_URL}/medication/care-recipients/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update care recipient: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating care recipient:', error);
      throw error;
    }
  }

  /**
   * Delete a care recipient and all associated medications
   * @param {string} id - Care recipient ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteCareRecipient(id) {
    try {
      const response = await fetch(`${FORUM_API_BASE_URL}/medication/care-recipients/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete care recipient: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting care recipient:', error);
      throw error;
    }
  }

  // ==================== MEDICATIONS CRUD ====================

  /**
   * Get all medications for the current user (optionally filtered by care recipient)
   * @param {string} careRecipientId - Optional care recipient ID filter
   * @returns {Promise<Array>} - Array of medications
   */
  async getMedications(careRecipientId = null) {
    try {
      let url = `${FORUM_API_BASE_URL}/medication/medications`;
      if (careRecipientId) {
        url += `?careRecipientId=${careRecipientId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch medications: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  }

  /**
   * Create a new medication
   * @param {Object} medicationData - Medication data
   * @returns {Promise<Object>} - Created medication
   */
  async createMedication(medicationData) {
    try {
      console.log('Scanner Service: Creating medication with data:', medicationData);
      
      const response = await fetch(`${FORUM_API_BASE_URL}/medication/medications`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicationData),
      });

      console.log('Scanner Service: Create medication response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Scanner Service: Create medication error response:', errorText);
        throw new Error(`Failed to create medication: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  }

  /**
   * Update a medication
   * @param {string} id - Medication ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated medication
   */
  async updateMedication(id, updateData) {
    try {
      const response = await fetch(`${FORUM_API_BASE_URL}/medication/medications/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update medication: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }

  /**
   * Delete a medication
   * @param {string} id - Medication ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteMedication(id) {
    try {
      const response = await fetch(`${FORUM_API_BASE_URL}/medication/medications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete medication: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }

  /**
   * Get complete medication data for the current user (care recipients with their medications)
   * @returns {Promise<Array>} - Array of care recipients with their medications
   */
  async getUserMedicationData() {
    try {
      const response = await fetch(`${FORUM_API_BASE_URL}/medication/user-data`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user medication data: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user medication data:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  // ==================== UTILITY METHODS ====================

  /**
   * Format scanned medication data for the form
   * @param {Object} scanResult - Result from the scanner API
   * @returns {Object} - Formatted medication data
   */
  formatMedicationData(scanResult) {
    if (!scanResult.success || !scanResult.medications || scanResult.medications.length === 0) {
      return null;
    }

    // Take the first (most confident) medication result
    const medication = scanResult.medications[0];
    
    return {
      name: medication.name || '',
      dosage: medication.dosage || '',
      usedTo: medication.usedFor || medication.usedTo || '',
      sideEffects: medication.sideEffects || '',
      schedule: medication.schedule || '',
      warnings: medication.warnings || '',
      image: medication.image || '',
      confidence: medication.confidence || 0,
      extractedText: scanResult.extractedText || '',
      brandNames: medication.brandNames || [],
      sources: medication.sources || []
    };
  }

  /**
   * Validate if an image file is acceptable for scanning
   * @param {File} file - The file to validate
   * @returns {boolean} - True if file is valid
   */
  validateImageFile(file) {
    if (!file) return false;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  /**
   * Check if camera is available on the device
   * @returns {Promise<boolean>} - True if camera is available
   */
  async isCameraAvailable() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }
      
      // Try to get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  }

  /**
   * Scan and save medication image to database
   * @param {File} imageFile - The image file to scan
   * @param {string} careRecipientId - Care recipient ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Scan results with saved medication data
   */
  async scanAndSaveMedication(imageFile, careRecipientId) {
    try {
      console.log('Scanner Service: Starting scan and save with file:', imageFile);
      console.log('Scanner Service: Care recipient ID:', careRecipientId);

      // First, scan the medication image using Scanner API
      console.log('Scanner Service: Scanning medication image...');
      const scanResult = await this.scanMedicationImage(imageFile);
      
      if (!scanResult || !scanResult.success) {
        throw new Error('Failed to scan medication image');
      }

      // Format the medication data
      console.log('Scanner Service: Formatting medication data...');
      const medicationData = this.formatMedicationData(scanResult);
      
      // Add the care recipient ID
      medicationData.careRecipientId = careRecipientId;

      // Save using Forum API (with JWT authentication)
      console.log('Scanner Service: Saving scanned medication via Forum API');
      const savedMedication = await this.createMedication(medicationData);
      
      console.log('Scanner Service: Successfully saved scanned medication');
      return {
        success: true,
        medication: savedMedication,
        scanData: scanResult
      };
    } catch (error) {
      console.error('Scanner Service: Save error:', error);
      throw error;
    }
  }

  /**
   * Request camera permissions
   * @returns {Promise<boolean>} - True if permissions granted
   */
  async requestCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately as we just wanted to check permissions
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  /**
   * Upload an image file to Cloudinary
   * @param {File} imageFile - The image file to upload
   * @returns {Promise<Object>} - Upload result with URL
   */
  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('medicationImage', imageFile);

      const response = await fetch(`${FORUM_API_BASE_URL}/medication/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload image: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param {string} publicId - The public ID of the image to delete
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteImage(publicId) {
    try {
      const response = await fetch(`${FORUM_API_BASE_URL}/medication/delete-image`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_id: publicId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete image: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}

export default new MedicationService();
