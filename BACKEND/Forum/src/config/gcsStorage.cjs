const { Storage } = require('@google-cloud/storage');

// Validate required environment variables with fallbacks
if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
  console.warn('⚠️ Missing GOOGLE_CLOUD_PROJECT_ID environment variable');
}

if (!process.env.GCS_BUCKET_NAME) {
  console.warn('⚠️ Missing GCS_BUCKET_NAME environment variable, using default');
}

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'default-bucket';

const gcsClient = {
  bucket: storage.bucket(bucketName),
  bucketName: bucketName,

  // Upload file to Google Cloud Storage
  uploadBuffer: async (buffer, fileName, mimeType) => {
    try {
      const file = gcsClient.bucket.file(fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: mimeType,
        },
        resumable: false,
      });

      return new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', () => {
          resolve({
            url: `gs://${gcsClient.bucketName}/${fileName}`,
            public_id: fileName,
            resource_type: mimeType.startsWith('video') ? 'video' : 'image',
          });
        });
        stream.end(buffer);
      });
    } catch (error) {
      console.error('Error uploading to GCS:', error);
      throw error;
    }
  },

  // Delete file from Google Cloud Storage
  destroy: async (publicId) => {
    try {
      const file = gcsClient.bucket.file(publicId);
      await file.delete();
      return { result: 'ok' };
    } catch (error) {
      console.error('Error deleting from GCS:', error);
      throw error;
    }
  },

  // Generate signed URL for accessing file
  url: async (publicId, options = {}) => {
    try {
      const file = gcsClient.bucket.file(publicId);
      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: new Date(Date.now() + (options.expiresSeconds || 24 * 60 * 60) * 1000),
      });
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
  }
};

module.exports = { gcsClient };