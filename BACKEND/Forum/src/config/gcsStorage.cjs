const { Storage } = require('@google-cloud/storage');

// Validate required environment variables with better error handling
if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
  console.error('❌ Missing GOOGLE_CLOUD_PROJECT_ID environment variable');
}

if (!process.env.GCS_BUCKET_NAME) {
  console.error('❌ Missing GCS_BUCKET_NAME environment variable');
}

// Initialize storage with error handling
let storage;
let bucketName = process.env.GCS_BUCKET_NAME;

try {
  const storageConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  };

  // Support both key file and environment variable authentication
  if (process.env.GOOGLE_CLOUD_KEY_JSON) {
    // Use service account key from environment variable
    console.log('🔑 Using Google Cloud credentials from environment variable');
    storageConfig.credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY_JSON);
  } else if (process.env.GOOGLE_CLOUD_KEY_FILE) {
    // Use service account key from file
    console.log('🔑 Using Google Cloud credentials from file:', process.env.GOOGLE_CLOUD_KEY_FILE);
    storageConfig.keyFilename = process.env.GOOGLE_CLOUD_KEY_FILE;
  } else {
    // Try using default credentials (useful for Google Cloud environments)
    console.log('🔑 Using default Google Cloud credentials');
  }

  storage = new Storage(storageConfig);
  
  if (bucketName) {
    console.log(`✅ Google Cloud Storage initialized with bucket: ${bucketName}`);
  } else {
    console.error('❌ No bucket name provided');
    bucketName = 'default-bucket'; // Fallback
  }
} catch (error) {
  console.error('❌ Failed to initialize Google Cloud Storage:', error);
  throw error;
}

const gcsClient = {
  bucket: bucketName ? storage.bucket(bucketName) : null,
  bucketName: bucketName,

  // Upload file to Google Cloud Storage
  uploadBuffer: async (buffer, fileName, mimeType) => {
    try {
      if (!gcsClient.bucket) {
        throw new Error('Google Cloud Storage bucket not initialized');
      }
      
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
      if (!gcsClient.bucket) {
        throw new Error('Google Cloud Storage bucket not initialized');
      }
      
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
      if (!gcsClient.bucket) {
        console.error('Google Cloud Storage bucket not initialized');
        return null;
      }
      
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