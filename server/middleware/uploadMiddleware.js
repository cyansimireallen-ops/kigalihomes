const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const allowedImageTypes = /jpeg|jpg|png|webp/;
const allowedVideoTypes = /mp4|mov|webm|mkv|avi/;

// Property listings accept two separate fields: `images` (up to 10 photos)
// and `video` (a single house-tour video). Each field is validated against
// its own allowed file types so a video can't be smuggled in as an "image".
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'video') {
    const isValidExt = allowedVideoTypes.test(ext);
    const isValidMime = file.mimetype.startsWith('video/');
    if (isValidExt && isValidMime) return cb(null, true);
    return cb(new Error('Video must be one of: mp4, mov, webm, mkv, avi'));
  }

  // default: images
  const isValidExt = allowedImageTypes.test(ext);
  const isValidMime = allowedImageTypes.test(file.mimetype);
  if (isValidExt && isValidMime) return cb(null, true);
  cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 60 * 1024 * 1024 }, // 60MB ceiling; images are typically far smaller, videos are the main use of the extra headroom
});

// Used on property create/update routes: up to 10 images + 1 optional video in the same multipart form.
const uploadPropertyMedia = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
]);

module.exports = upload;
module.exports.uploadPropertyMedia = uploadPropertyMedia;
