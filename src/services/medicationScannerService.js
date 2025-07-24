/**
 * Medication Scanner Service
 * Handles communication with the Scanner API backend
 */

const SCANNER_API_BASE_URL = 'http://localhost:3001';

class MedicationScannerService {
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
  async checkApiHealth() {
    try {
      const response = await fetch(`${SCANNER_API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Scanner API not available:', error);
      return false;
    }
  }

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
      usedFor: medication.usedFor || '',
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
  async scanAndSaveMedication(imageFile, careRecipientId, userId) {
    try {
      console.log('Scanner Service: Starting scan and save with file:', imageFile);
      console.log('Scanner Service: Care recipient ID:', careRecipientId);
      console.log('Scanner Service: User ID:', userId);

      const formData = new FormData();
      formData.append('medicationImage', imageFile);
      formData.append('careRecipientId', careRecipientId);
      formData.append('userId', userId);

      console.log('Scanner Service: Sending save request to:', `${SCANNER_API_BASE_URL}/save-scanned-medication`);

      const response = await fetch(`${SCANNER_API_BASE_URL}/save-scanned-medication`, {
        method: 'POST',
        body: formData,
      });

      console.log('Scanner Service: Save response received');
      console.log('Scanner Service: Save response status:', response.status);

      const contentType = response.headers.get('content-type');
      console.log('Scanner Service: Save response headers:', {
        'content-type': contentType,
        'content-length': response.headers.get('content-length')
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Scanner Service: Save request failed:', errorText);
        throw new Error(`Scanner service error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Scanner Service: Save success response:', result);

      return result;
    } catch (error) {
      console.error('Scanner Service: Save error:', error);
      throw error;
    }
  }

  /**
   * Get care recipients for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Care recipients data
   */
  async getCareRecipients(userId) {
    try {
      const response = await fetch(`${SCANNER_API_BASE_URL}/care-recipients/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch care recipients: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Scanner Service: Error fetching care recipients:', error);
      throw error;
    }
  }

  /**
   * Create a new care recipient
   * @param {Object} recipientData - Care recipient data
   * @returns {Promise<Object>} - Created care recipient
   */
  async createCareRecipient(recipientData) {
    try {
      const response = await fetch(`${SCANNER_API_BASE_URL}/care-recipients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipientData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create care recipient: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Scanner Service: Error creating care recipient:', error);
      throw error;
    }
  }

  /**
   * Get medications for a care recipient
   * @param {string} careRecipientId - Care recipient ID
   * @returns {Promise<Object>} - Medications data
   */
  async getMedications(careRecipientId) {
    try {
      const response = await fetch(`${SCANNER_API_BASE_URL}/medications/${careRecipientId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch medications: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Scanner Service: Error fetching medications:', error);
      throw error;
    }
  }

  /**
   * Delete a medication from the database
   * @param {string} medicationId - Medication ID to delete
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteMedication(medicationId) {
    try {
      const response = await fetch(`${SCANNER_API_BASE_URL}/medications/${medicationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete medication: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Scanner Service: Error deleting medication:', error);
      throw error;
    }
  }

  /**
   * Delete a care recipient and all their medications
   * @param {string} careRecipientId - Care recipient ID to delete
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteCareRecipient(careRecipientId) {
    try {
      const response = await fetch(`${SCANNER_API_BASE_URL}/care-recipients/${careRecipientId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete care recipient: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Scanner Service: Error deleting care recipient:', error);
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
}

export default new MedicationScannerService();
