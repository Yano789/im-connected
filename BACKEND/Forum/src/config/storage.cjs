const multer = require('multer');
const { gcsClient } = require('./gcsStorage.cjs');

// Create custom storage for Google Cloud Storage
const gcsStorage = {
  _handleFile: function (req, file, cb) {
    const fileName = `forum_uploads/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Collect file chunks
    const chunks = [];
    file.stream.on('data', chunk => chunks.push(chunk));
    file.stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const result = await gcsClient.uploadBuffer(buffer, fileName, file.mimetype);
        
        cb(null, {
          url: result.url,
          public_id: result.public_id,
          resource_type: result.resource_type,
          filename: fileName,
          mimetype: file.mimetype,
          size: buffer.length
        });
      } catch (error) {
        cb(error);
      }
    });
    file.stream.on('error', cb);
  },
  _removeFile: function (req, file, cb) {
    // Clean up if needed
    cb();
  }
};

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp','video/mp4', 'video/webm'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, GIF, WEBP, MP4, and WEBM files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: gcsStorage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

module.exports = upload;