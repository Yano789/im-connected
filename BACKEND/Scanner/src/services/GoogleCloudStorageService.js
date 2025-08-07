import { Storage } from '@google-cloud/storage';
import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

/**
 * Google Cloud Storage Service for image uploads
 */
class GoogleCloudStorageService {
  constructor() {
    this.forumBackendUrl = process.env.FORUM_BACKEND_URL || 'http://localhost:5001';
    
    // Initialize Google Cloud Storage client
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });
    
    this.bucket = this.storage.bucket(process.env.GCS_BUCKET_NAME);
  }

  /**
   * Upload image to Google Cloud Storage directly
   */
  async uploadImageDirect(imagePath) {
    try {
      console.log('Uploading image to Google Cloud Storage:', imagePath);
      
      const fileName = `scanner_uploads/${Date.now()}-${imagePath.split('/').pop().replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const file = this.bucket.file(fileName);
      
      // Upload the file
      await this.bucket.upload(imagePath, {
        destination: fileName,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });
      
      // Generate signed URL for access
      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
      
      console.log('Image successfully uploaded to Google Cloud Storage:', signedUrl);
      
      return {
        url: signedUrl,
        publicId: fileName
      };
    } catch (error) {
      console.error('Error uploading to Google Cloud Storage:', error);
      throw error;
    }
  }

  /**
   * Upload image to Google Cloud Storage via Forum backend (preferred method)
   */
  async uploadImage(imagePath, authToken = null) {
    try {
      console.log('Uploading image to Google Cloud Storage via Forum backend:', imagePath);
      
      // Create FormData for the request
      const formData = new FormData();
      
      // Add the image file to form data
      const imageStream = fs.createReadStream(imagePath);
      formData.append('medicationImage', imageStream);
      
      // Make request to Forum backend's upload endpoint
      const response = await fetch(`${this.forumBackendUrl}/api/medications/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          ...formData.getHeaders()
        }
      });
      
      if (!response.ok) {
        throw new Error(`Google Cloud Storage upload failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Image successfully uploaded to Google Cloud Storage:', result.data);
      
      return {
        url: result.data.url,
        publicId: result.data.public_id
      };
    } catch (error) {
      console.error('Error uploading to Google Cloud Storage:', error);
      throw error;
    }
  }

  /**
   * Delete image from Google Cloud Storage directly
   */
  async deleteImageDirect(publicId) {
    try {
      console.log('Deleting image from Google Cloud Storage:', publicId);
      
      const file = this.bucket.file(publicId);
      await file.delete();
      
      console.log('Image successfully deleted from Google Cloud Storage:', publicId);
      
      return {
        result: 'ok'
      };
    } catch (error) {
      console.error('Error deleting from Google Cloud Storage:', error);
      throw error;
    }
  }

  /**
   * Delete image from Google Cloud Storage via Forum backend (preferred method)
   */
  async deleteImage(publicId, authToken = null) {
    try {
      console.log('Deleting image from Google Cloud Storage via Forum backend:', publicId);
      
      const response = await fetch(`${this.forumBackendUrl}/api/medications/delete-image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify({ publicId })
      });
      
      if (!response.ok) {
        throw new Error(`Google Cloud Storage deletion failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Image successfully deleted from Google Cloud Storage:', result);
      
      return result;
    } catch (error) {
      console.error('Error deleting from Google Cloud Storage:', error);
      throw error;
    }
  }
}

export default GoogleCloudStorageService;
