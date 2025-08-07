const { Storage } = require('@google-cloud/storage');

// Check if Google Cloud Storage is configured
const isGCSConfigured = process.env.GCS_BUCKET_NAME && 
                       process.env.GOOGLE_CLOUD_PROJECT_ID;

let storage = null;
let gcsClient = null;

if (isGCSConfigured) {
  try {
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });

    gcsClient = {
      bucket: storage.bucket(process.env.GCS_BUCKET_NAME),
      bucketName: process.env.GCS_BUCKET_NAME,
      
      // Method to generate signed URL (similar to cloudinary.url())
      url: async (publicId, options = {}) => {
        try {
          const file = gcsClient.bucket.file(publicId);
          const [signedUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + (options.expires || 24 * 60 * 60 * 1000), // 24 hours default
          });
          return signedUrl;
        } catch (error) {
          console.error('Error generating URL:', error);
          return null;
        }
      }
    };
  } catch (error) {
    console.warn('Google Cloud Storage not configured, using fallback:', error.message);
    gcsClient = null;
  }
} else {
  console.log('Google Cloud Storage environment variables not found, GCS will be disabled');
}

module.exports = { gcsClient };