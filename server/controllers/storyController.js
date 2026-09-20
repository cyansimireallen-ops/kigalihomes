const multer = require('multer');
const asyncHandler = require('../middleware/asyncHandler');
const Story = require('../models/Story');
const cloudinary = require('../config/cloudinary');

// Self-contained upload setup (same pattern as the rest of the app's uploads:
// memory storage, then streamed straight to Cloudinary — nothing touches local
// disk, so this survives redeploys on hosts with ephemeral storage).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // stories are a single image, 15MB is plenty
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Story image must be a JPG, PNG, or WEBP file'));
  },
});

const uploadStoryImage = upload.single('image');

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'kigalihomes/stories', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

// @desc  Create a story (owner/agent or admin). Expires 24h from now.
// @route POST /api/stories
const createStory = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('An image is required');
  }

  const result = await uploadBufferToCloudinary(req.file.buffer);

  const story = await Story.create({
    owner: req.user._id,
    image: result.secure_url,
    caption: req.body.caption || '',
    expiresAt: new Date(Date.now() + STORY_LIFETIME_MS),
  });

  const populated = await story.populate('owner', 'name profileImage role');
  res.status(201).json({ success: true, story: populated });
});

// @desc  List active (not yet expired) stories, newest first, grouped implicitly
//        by owner on the frontend. Public — anyone visiting the homepage sees them.
// @route GET /api/stories
const getActiveStories = asyncHandler(async (req, res) => {
  const stories = await Story.find({ expiresAt: { $gt: new Date() } })
    .populate('owner', 'name profileImage role')
    .sort({ createdAt: -1 });

  res.json({ success: true, stories });
});

// @desc  Delete a story (its owner, or an admin)
// @route DELETE /api/stories/:id
const deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error('Story not found');
  }

  const isOwner = story.owner.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this story');
  }

  await story.deleteOne();
  res.json({ success: true, message: 'Story deleted' });
});

// @desc  Get the current user's own stories (active or not) — used on their
//        profile page to manage/delete what they've posted.
// @route GET /api/stories/mine
const getMyStories = asyncHandler(async (req, res) => {
  const stories = await Story.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, stories });
});

module.exports = { uploadStoryImage, createStory, getActiveStories, deleteStory, getMyStories };
