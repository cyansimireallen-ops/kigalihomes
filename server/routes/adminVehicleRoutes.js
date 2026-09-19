const express = require('express');
const { getAllVehicles, adminUpdateVehicle, adminDeleteVehicle } = require('../controllers/adminVehicleController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Self-contained: applies protect+adminOnly itself, same as the main adminRoutes.js
// does, but mounted at its own path so this file never needs to touch adminRoutes.js.
router.use(protect, adminOnly);

router.get('/', getAllVehicles);
router.put('/:id', adminUpdateVehicle);
router.delete('/:id', adminDeleteVehicle);

module.exports = router;
