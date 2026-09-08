const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const allowedImageTypes = /jpeg|jpg|png|webp/;
const allowedVideoTypes = /mp4|mov|webm|mkv|avi/;

// Files are held in memory (not written to local disk) and streamed straight
// up to Cloudinary — this is what makes uploaded images/videos survive a
// redeploy on hosts with ephemeral disks (like Render's free tier), since
// they end up living on Cloudinary permanently instead of on the server.
const storage = multer.memoryStorage();

// Property listings accept two separate fields: `images` (up to 10 photos)
// and `video` (a single house-tour video). Each field is validated against
// its own allowed file types so a video can't be smuggled in as an "image".
const fileFilter = (req, file, cb) => {
  const ext = (file.originalname.split('.').pop() || '').toLowerCase();

  if (file.fieldname === 'video') {
    const isValidExt = allowedVideoTypes.test(ext);
    const isValidMime = file.mimetype.startsWith('video/');
    if (isValidExt && isValidMime) return cb(null, true);
    return cb(new Error('Video must be one of: mp4, mov, webm, mkv, avi'));
  }

  // default: images (covers both the `images` field and `profileImage`)
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

// Used on the profile-update route: a single profile picture.
const uploadSingleImage = upload.single('profileImage');

function uploadBufferToCloudinary(buffer, resourceType) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'kigalihomes', resource_type: resourceType },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// Runs after uploadPropertyMedia, before the property controller. Uploads
// whatever multer parsed into memory up to Cloudinary, then attaches the
// resulting permanent URLs to the request as req.uploadedImages (array of
// strings) and req.uploadedVideo (string, or '' if no video was sent).
const uploadPropertyMediaToCloudinary = async (req, res, next) => {
  try {
    req.uploadedImages = [];
    req.uploadedVideo = '';

    const imageFiles = req.files?.images || [];
    if (imageFiles.length > 0) {
      const results = await Promise.all(
        imageFiles.map((f) => uploadBufferToCloudinary(f.buffer, 'image'))
      );
      req.uploadedImages = results.map((r) => r.secure_url);
    }

    const videoFile = req.files?.video?.[0];
    if (videoFile) {
      const result = await uploadBufferToCloudinary(videoFile.buffer, 'video');
      req.uploadedVideo = result.secure_url;
    }

    next();
  } catch (err) {
    next(err);
  }
};

// Runs after uploadSingleImage, before the profile controller. Attaches the
// resulting permanent URL to the request as req.uploadedImage (string, or
// undefined if no file was sent).
const uploadProfileImageToCloudinary = async (req, res, next) => {
  try {
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'image');
      req.uploadedImage = result.secure_url;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = upload;
module.exports.uploadPropertyMedia = uploadPropertyMedia;
module.exports.uploadPropertyMediaToCloudinary = uploadPropertyMediaToCloudinary;
module.exports.uploadSingleImage = uploadSingleImage;
module.exports.uploadProfileImageToCloudinary = uploadProfileImageToCloudinary;
