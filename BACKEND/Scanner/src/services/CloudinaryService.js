import fs from 'fs';
import FormData from 'form-data';

/**
 * Cloudinary Service for image uploads via Forum backend
 */
class CloudinaryService {
  constructor() {
    this.forumBackendUrl = process.env.FORUM_BACKEND_URL || 'http://localhost:5001';
  }

  /**
   * Upload image to Cloudinary via Forum backend
   */
  async uploadImage(imagePath, authToken = null) {
    try {
      console.log('Uploading image to Cloudinary via Forum backend:', imagePath);
      
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
        throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Image successfully uploaded to Cloudinary:', result.data);
      
      return {
        url: result.data.url,
        publicId: result.data.public_id
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Delete image from Cloudinary via Forum backend
   */
  async deleteImage(publicId, authToken = null) {
    try {
      console.log('Deleting image from Cloudinary via Forum backend:', publicId);
      
      const response = await fetch(`${this.forumBackendUrl}/api/medications/delete-image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify({ publicId })
      });
      
      if (!response.ok) {
        throw new Error(`Cloudinary delete failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Image successfully deleted from Cloudinary:', result);
      
      return result;
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw error;
    }
  }
}

export default CloudinaryService;
