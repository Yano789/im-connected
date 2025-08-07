
// gcs-storage.js (replaces your multer-cloudinary setup)
const multer = require('multer');
const { gcsClient } = require('./googleConfig.cjs');
const crypto = require('crypto');
const path = require('path');

// Custom storage engine that mimics CloudinaryStorage
class GCSStorage {
  constructor(options) {
    this.options = options;
    this.bucket = options.gcsClient.bucket;
    this.bucketName = options.gcsClient.bucketName;
  }

  _handleFile(req, file, cb) {
    // Get params from options (same interface as CloudinaryStorage)
    const getParams = async () => {
      if (typeof this.options.params === 'function') {
        return await this.options.params(req, file);
      }
      return this.options.params || {};
    };

    const uploadFile = async () => {
      try {
        const params = await getParams();
        
        // Generate filename similar to Cloudinary's public_id
        const folder = params.folder || 'uploads';
        const resource_type = params.resource_type || 'auto';
        const format = params.format || file.originalname.split('.').pop();
        const public_id = params.public_id || `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
        
        // Create full path
        const fileName = `${folder}/${public_id}.${format}`;
        
        const fileUpload = this.bucket.file(fileName);
        
        // Create upload stream
        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
            metadata: {
              originalName: file.originalname,
              folder: folder,
              resource_type: resource_type,
              public_id: public_id,
              uploadTime: new Date().toISOString()
            }
          },
          resumable: true,
          validation: 'crc32c'
        });

        // Handle stream events
        stream.on('error', (error) => {
          cb(error);
        });

        stream.on('finish', async () => {
          try {
            // Generate signed URL
            const [signedUrl] = await fileUpload.getSignedUrl({
              version: 'v4',
              action: 'read',
              expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            });

            // Return file info in Cloudinary-like format
            cb(null, {
              // Cloudinary-compatible properties
              public_id: `${folder}/${public_id}`,
              secure_url: signedUrl,
              url: signedUrl,
              resource_type: resource_type,
              format: format,
              bytes: file.size || 0,
              folder: folder,
              original_filename: file.originalname,
              
              // Additional GCS properties
              filename: fileName,
              bucket: this.bucketName,
              fieldname: file.fieldname,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size || 0
            });
          } catch (error) {
            cb(error);
          }
        });

        // Pipe file buffer to stream
        const { encrypt } = require('./utils/crypto');
        const encryptedBuffer = encrypt(file.buffer);
        stream.end(encryptedBuffer);

        
      } catch (error) {
        cb(error);
      }
    };

    uploadFile();
  }

  _removeFile(req, file, cb) {
    // Handle file removal if needed
    if (file.filename) {
      this.bucket.file(file.filename).delete()
        .then(() => cb(null))
        .catch(cb);
    } else {
      cb(null);
    }
  }
}

// Create storage instance (same interface as CloudinaryStorage)
const storage = new GCSStorage({
  gcsClient,
  params: async (req, file) => {
    let folder = 'forum_uploads';
    let resource_type = file.mimetype.startsWith('video') ? 'video' : 'image';
    return {
      folder,
      resource_type,
      format: file.originalname.split('.').pop(), // use original extension
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // custom name
    };
  }
});

// File filter (exactly the same as your Cloudinary version)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp','video/mp4', 'video/webm'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, and MP4 files are allowed'), false);
  }
  cb(null, true);
};

// Multer configuration (exactly the same interface as your current setup)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

module.exports = upload;