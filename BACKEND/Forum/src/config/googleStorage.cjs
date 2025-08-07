const multer = require('multer');
const { gcsClient } = require('./googleConfig.cjs');
const crypto = require("crypto")

class GCSStorage {
  constructor(options) {
    this.options = options;
    this.bucket = options.gcsClient.bucket;
    this.bucketName = options.gcsClient.bucketName;
  }

  _handleFile(req, file, cb) {
    const getParams = async () => {
      if (typeof this.options.params === 'function') {
        return await this.options.params(req, file);
      }
      return this.options.params || {};
    };

    (async () => {
      try {
        const params = await getParams();

        const folder = params.folder || 'uploads';
        const resource_type = params.resource_type || 'auto';
        const format = file.originalname.split('.').pop();
        const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
        const fileName = `${folder}/${uniqueId}.${format}`;  // Full path with extension

        const fileUpload = this.bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
            metadata: {
              originalName: file.originalname,
              folder,
              resource_type,
              public_id: fileName, // store full path as public_id
              uploadTime: new Date().toISOString(),
            }
          },
          resumable: true,
          validation: 'crc32c',
        });

        stream.on('error', (error) => {
          cb(error);
        });

        stream.on('finish', async () => {
          // Pass expires as a Date object here
          const [signedUrl] = await fileUpload.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          });
          console.log(signedUrl)

          cb(null, {
            public_id: fileName,  // full path with extension
            secure_url: signedUrl,
            url: signedUrl,
            resource_type,
            format,
            bytes: file.size || 0,
            folder,
            original_filename: file.originalname,
            filename: fileName,
            bucket: this.bucketName,
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size || 0,
          });
        });

        file.stream.pipe(stream);
      } catch (error) {
        cb(error);
      }
    })();
  }

  _removeFile(req, file, cb) {
    if (file.filename) {
      this.bucket.file(file.filename).delete()
        .then(() => cb(null))
        .catch(cb);
    } else {
      cb(null);
    }
  }
}

const storage = new GCSStorage({
  gcsClient,
  params: async (req, file) => {
    const folder = 'forum_uploads';
    const resource_type = file.mimetype.startsWith('video') ? 'video' : 'image';
    return {
      folder,
      resource_type,
      format: file.originalname.split('.').pop(),
      // Do not include public_id here because upload generates uniqueId with extension
    };
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm'
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, GIF, WEBP, MP4, and WEBM files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

module.exports = upload;
