const express = require('express');
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  getAllProperties,
  adminUpdateProperty,
  adminDeleteProperty,
  getReports,
  updateReport,
} = require('../controllers/adminController');
const { createOwnerOrAgent } = require('../controllers/authController');
const { getSettings, updateSettings } = require('../controllers/siteSettingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Every route below requires a valid JWT AND role === 'admin', verified server-side.
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.post('/users', createOwnerOrAgent);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);

router.get('/properties', getAllProperties);
router.put('/properties/:id', adminUpdateProperty);
router.delete('/properties/:id', adminDeleteProperty);

router.get('/reports', getReports);
router.put('/reports/:id', updateReport);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
