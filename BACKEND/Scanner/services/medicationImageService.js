/**
 * Service for uploading medication images to the forum database
 */

class MedicationImageService {
    constructor() {
        this.baseUrl = 'http://localhost:5001/api/v1';
    }

    /**
     * Upload medication image to the forum database
     * @param {File} imageFile - The image file to upload
     * @param {string} medicationName - Name of the medication (for metadata)
     * @returns {Promise<Object>} - Response with image URL and metadata
     */
    async uploadMedicationImage(imageFile, medicationName = '') {
        try {
            const formData = new FormData();
            formData.append('media', imageFile);
            formData.append('title', `Medication Image: ${medicationName || 'Unknown'}`);
            formData.append('content', `Uploaded medication image for ${medicationName || 'medication'}`);
            formData.append('tags', 'medication');
            formData.append('tags', 'image');
            formData.append('draft', 'true'); // Mark as draft so it doesn't show in public forum

            const response = await fetch(`${this.baseUrl}/post/create`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${errorText}`);
            }

            const result = await response.json();
            console.log('Medication image uploaded successfully:', result);

            // Extract the image URL from the response
            if (result.media && result.media.length > 0) {
                return {
                    success: true,
                    imageUrl: result.media[0].secure_url || result.media[0].url,
                    publicId: result.media[0].public_id,
                    postId: result.postId || result._id,
                    message: 'Image uploaded successfully'
                };
            } else {
                throw new Error('No media found in upload response');
            }

        } catch (error) {
            console.error('Error uploading medication image:', error);
            return {
                success: false,
                error: error.message,
                imageUrl: null
            };
        }
    }

    /**
     * Upload image using alternative method (direct image upload if available)
     * @param {File} imageFile - The image file to upload
     * @returns {Promise<Object>} - Response with image URL
     */
    async uploadImageDirect(imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            // Try direct image upload endpoint if it exists
            const response = await fetch(`${this.baseUrl}/upload/image`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                // Fallback to post creation method
                return this.uploadMedicationImage(imageFile, 'Medication');
            }

            const result = await response.json();
            return {
                success: true,
                imageUrl: result.url || result.secure_url,
                publicId: result.public_id,
                message: 'Image uploaded successfully'
            };

        } catch (error) {
            console.error('Direct upload failed, trying post method:', error);
            // Fallback to post creation method
            return this.uploadMedicationImage(imageFile, 'Medication');
        }
    }

    /**
     * Convert File object to base64 for local preview
     * @param {File} file - The file to convert
     * @returns {Promise<string>} - Base64 string
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Create a temporary URL for image preview
     * @param {File} file - The file to create URL for
     * @returns {string} - Temporary URL
     */
    createPreviewUrl(file) {
        return URL.createObjectURL(file);
    }

    /**
     * Clean up temporary URLs
     * @param {string} url - The URL to revoke
     */
    revokePreviewUrl(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }
}

export default new MedicationImageService();
