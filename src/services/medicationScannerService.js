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
      const formData = new FormData();
      formData.append('medicationImage', imageFile);

      const response = await fetch(`${SCANNER_API_BASE_URL}/scan-medication`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scan medication image');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error scanning medication:', error);
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
