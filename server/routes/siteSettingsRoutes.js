const express = require('express');
const { getSettings } = require('../controllers/siteSettingsController');

const router = express.Router();

// Public — the About/Contact/FAQ/Privacy/Terms pages and the footer all read from this.
router.get('/', getSettings);

module.exports = router;
