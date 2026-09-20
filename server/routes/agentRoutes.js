const express = require('express');
const { getPublicProfile, getFeaturedAgents } = require('../controllers/publicProfileController');

const router = express.Router();

router.get('/featured', getFeaturedAgents); // must come before /:id
router.get('/:id', getPublicProfile);

module.exports = router;
