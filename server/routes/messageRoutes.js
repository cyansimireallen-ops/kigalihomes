const express = require('express');
const { getConversations, getThread, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getConversations);
router.get('/:userId', protect, getThread);
router.post('/', protect, sendMessage);

module.exports = router;
