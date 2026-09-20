const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Property = require('../models/Property');

let Vehicle = null;
try {
  // Optional — only present if the Vehicles feature has been added to this project.
  Vehicle = require('../models/Vehicle');
} catch {
  Vehicle = null;
}

// @desc  Public profile for an owner/agent or admin — shown on the homepage
//        and linked from "Listed by {name}" on property/vehicle detail pages.
//        Never exposes email, phone, or password — only what's safe to show
//        publicly, plus their current active listings.
// @route GET /api/agents/:id
const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name bio profileImage role createdAt');

  if (!user || user.role === 'seeker') {
    res.status(404);
    throw new Error('Profile not found');
  }

  const properties = await Property.find({ owner: user._id, status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(12);

  let vehicles = [];
  if (Vehicle) {
    vehicles = await Vehicle.find({ owner: user._id, status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(12);
  }

  res.json({
    success: true,
    profile: {
      _id: user._id,
      name: user.name,
      bio: user.bio,
      profileImage: user.profileImage,
      role: user.role,
      memberSince: user.createdAt,
    },
    properties,
    vehicles,
  });
});

// @desc  A handful of active owner/agent profiles to feature on the homepage
//        (whoever has the most currently-approved listings, admins excluded
//        so the homepage highlights agents rather than the platform's own team).
// @route GET /api/agents/featured
const getFeaturedAgents = asyncHandler(async (req, res) => {
  const ownerIds = await Property.distinct('owner', { status: 'approved' });

  let vehicleOwnerIds = [];
  if (Vehicle) {
    vehicleOwnerIds = await Vehicle.distinct('owner', { status: 'approved' });
  }

  const allIds = [...new Set([...ownerIds, ...vehicleOwnerIds].map((id) => id.toString()))];

  const agents = await User.find({ _id: { $in: allIds }, role: 'owner', isDeleted: { $ne: true } })
    .select('name bio profileImage')
    .limit(8);

  res.json({ success: true, agents });
});

module.exports = { getPublicProfile, getFeaturedAgents };
