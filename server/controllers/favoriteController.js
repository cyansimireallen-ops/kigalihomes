const asyncHandler = require('../middleware/asyncHandler');
const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

// @desc  Get logged-in user's saved properties
// @route GET /api/favorites
const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id }).populate({
    path: 'property',
    populate: { path: 'owner', select: 'name phone' },
  });

  res.json({ success: true, favorites: favorites.filter((f) => f.property) });
});

// @desc  Save a property
// @route POST /api/favorites/:propertyId
const addFavorite = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  const existing = await Favorite.findOne({ user: req.user._id, property: property._id });
  if (existing) {
    return res.json({ success: true, message: 'Already saved', favorite: existing });
  }

  const favorite = await Favorite.create({ user: req.user._id, property: property._id });
  res.status(201).json({ success: true, favorite });
});

// @desc  Remove a saved property
// @route DELETE /api/favorites/:propertyId
const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.findOneAndDelete({ user: req.user._id, property: req.params.propertyId });
  res.json({ success: true, message: 'Removed from favorites' });
});

module.exports = { getFavorites, addFavorite, removeFavorite };
