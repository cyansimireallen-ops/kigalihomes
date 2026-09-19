const express = require('express');
const {
  getVehicles,
  getFeaturedVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getMyVehicles,
} = require('../controllers/vehicleController');
const { protect, ownerOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getVehicles);
router.get('/featured', getFeaturedVehicles);
router.get('/mine/all', protect, getMyVehicles);
router.get('/:id', getVehicleById);

// Reuses the same images+video → Cloudinary upload chain that property listings use —
// it's generic (just looks for 'images' and 'video' form fields), so nothing in
// uploadMiddleware.js needs to change for vehicles to use it too.
router.post('/', protect, ownerOrAdmin, upload.uploadPropertyMedia, upload.uploadPropertyMediaToCloudinary, createVehicle);
router.put('/:id', protect, upload.uploadPropertyMedia, upload.uploadPropertyMediaToCloudinary, updateVehicle);
router.delete('/:id', protect, deleteVehicle);

module.exports = router;
