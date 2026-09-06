const express = require('express');
const { getMe, updateMe, changePassword, deleteMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('profileImage'), updateMe);
router.put('/me/password', protect, changePassword);
router.delete('/me', protect, deleteMe);

module.exports = router;
