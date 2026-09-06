const express = require('express');
const { createReport, getMyReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createReport);
router.get('/mine', protect, getMyReports);

module.exports = router;
