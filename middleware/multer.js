// middleware/multer.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'fitnessSync/others';

    if (file.mimetype.startsWith('image/')) {
      folder = 'fitnessSync/images';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'fitnessSync/videos';
    }

    return {
      folder,
      resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      allowed_formats: ['jpg', 'png', 'mp4'],
      public_id: `upload-${Date.now()}` // Optional unique ID
    };
  }
});

const upload = multer({ storage });

module.exports = upload;
