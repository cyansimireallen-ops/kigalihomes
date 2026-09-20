const express = require('express');
const { uploadStoryImage, createStory, getActiveStories, deleteStory, getMyStories } = require('../controllers/storyController');
const { protect, ownerOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getActiveStories); // public — shown on the homepage
router.get('/mine', protect, getMyStories);
router.post('/', protect, ownerOrAdmin, uploadStoryImage, createStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
