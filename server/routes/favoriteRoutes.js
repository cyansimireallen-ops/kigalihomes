const express = require('express');
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/:propertyId', protect, addFavorite);
router.delete('/:propertyId', protect, removeFavorite);

module.exports = router;
