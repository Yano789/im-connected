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
    this.initialized = false;
    this.storage = null;
    this.bucket = null;
  }

  /**
   * Initialize Google Cloud Storage client
   */
  _initialize() {
    if (this.initialized) {
      return;
    }

    // Check for required environment variables
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      console.warn('⚠️ GOOGLE_CLOUD_PROJECT_ID environment variable is not set');
    }

    if (!process.env.GCS_BUCKET_NAME) {
      console.warn('⚠️ GCS_BUCKET_NAME environment variable is not set');
    }
    
    // Only initialize Google Cloud Storage client if we have the required variables
    if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GCS_BUCKET_NAME) {
      try {
        const storageConfig = {
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        };

        // Support both key file and environment variable authentication
        if (process.env.GOOGLE_CLOUD_KEY_JSON) {
          // Use service account key from environment variable
          console.log('🔑 Scanner: Using Google Cloud credentials from environment variable');
          storageConfig.credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY_JSON);
        } else if (process.env.GOOGLE_CLOUD_KEY_FILE) {
          // Use service account key from file
          console.log('🔑 Scanner: Using Google Cloud credentials from file:', process.env.GOOGLE_CLOUD_KEY_FILE);
          storageConfig.keyFilename = process.env.GOOGLE_CLOUD_KEY_FILE;
        } else {
          // Try using default credentials
          console.log('🔑 Scanner: Using default Google Cloud credentials');
        }

        this.storage = new Storage(storageConfig);
        
        this.bucket = this.storage.bucket(process.env.GCS_BUCKET_NAME);
        console.log(`✅ Scanner: Google Cloud Storage client initialized successfully with bucket: ${process.env.GCS_BUCKET_NAME}`);
      } catch (error) {
        console.error('❌ Scanner: Failed to initialize Google Cloud Storage client:', error.message);
        this.storage = null;
        this.bucket = null;
      }
    } else {
      console.warn('⚠️ Scanner: Google Cloud Storage client not initialized - missing environment variables');
      this.storage = null;
      this.bucket = null;
    }

    this.initialized = true;
  }

  /**
   * Upload image to Google Cloud Storage directly
   */
  async uploadImageDirect(imagePath) {
    this._initialize();
    
    try {
      if (!this.bucket) {
        throw new Error('Google Cloud Storage bucket not initialized. Check environment variables.');
      }
      
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
    this._initialize();
    
    try {
      console.log('Uploading image to Google Cloud Storage via Forum backend:', imagePath);
      
      // Create FormData for the request
      const formData = new FormData();
      
      // Add the image file to form data
      const imageStream = fs.createReadStream(imagePath);
      formData.append('medicationImage', imageStream);
      
      // Make request to Forum backend's upload endpoint
      const response = await fetch(`${this.forumBackendUrl}/api/v1/medication/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          ...formData.getHeaders()
        }
      });
      
      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status, 'Error:', errorText);
        throw new Error(`Google Cloud Storage upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Expected JSON response but got:', contentType, 'Response:', responseText.substring(0, 500));
        throw new Error(`Expected JSON response but got ${contentType}. This usually means the server returned an error page.`);
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
    this._initialize();
    
    try {
      if (!this.bucket) {
        throw new Error('Google Cloud Storage bucket not initialized. Check environment variables.');
      }
      
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
    this._initialize();
    
    try {
      console.log('Deleting image from Google Cloud Storage via Forum backend:', publicId);
      
      const response = await fetch(`${this.forumBackendUrl}/api/v1/medication/delete-image`, {
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
