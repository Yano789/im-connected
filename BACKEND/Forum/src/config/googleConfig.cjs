const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const gcsClient = {
  bucket: storage.bucket(process.env.GCS_BUCKET_NAME),
  bucketName: process.env.GCS_BUCKET_NAME,

  url: async (publicId, options = {}) => {
    try {
      console.log("Generating signed URL for:", publicId);
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
