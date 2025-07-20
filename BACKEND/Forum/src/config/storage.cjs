const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./cloudinary.cjs');

const storage = new CloudinaryStorage({
  cloudinary,
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

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, and MP4 files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

module.exports = upload;