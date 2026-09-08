const express = require('express');
const {
  getProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
} = require('../controllers/propertyController');
const { protect, ownerOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/mine/all', protect, getMyProperties);
router.get('/:id', getPropertyById);

router.post('/', protect, ownerOrAdmin, upload.uploadPropertyMedia, upload.uploadPropertyMediaToCloudinary, createProperty);
router.put('/:id', protect, upload.uploadPropertyMedia, upload.uploadPropertyMediaToCloudinary, updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router;