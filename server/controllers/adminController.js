const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Property = require('../models/Property');
const Report = require('../models/Report');

// @desc  Admin dashboard statistics
// @route GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProperties,
    pendingProperties,
    approvedProperties,
    featuredProperties,
    reportedProperties,
    rentCount,
    saleCount,
    typeAgg,
    listingsOverTime,
    usersOverTime,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    Property.countDocuments(),
    Property.countDocuments({ status: 'pending' }),
    Property.countDocuments({ status: 'approved' }),
    Property.countDocuments({ isFeatured: true }),
    Report.countDocuments({ status: 'pending' }),
    Property.countDocuments({ purpose: 'rent' }),
    Property.countDocuments({ purpose: 'sale' }),
    Property.aggregate([{ $group: { _id: '$propertyType', count: { $sum: 1 } } }]),
    Property.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
    User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProperties,
      pendingProperties,
      approvedProperties,
      featuredProperties,
      reportedProperties,
      rentVsSale: { rent: rentCount, sale: saleCount },
      propertyTypes: typeAgg,
      listingsOverTime,
      usersOverTime,
    },
  });
});

// @desc  Get all users (search/filter). Soft-deleted users are hidden unless
//        ?deleted=true is passed (used by the admin "Deleted" tab).
// @route GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const filter = { role: { $ne: 'admin' } };
  filter.isDeleted = req.query.deleted === 'true';
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'disabled') filter.isActive = false;
  if (req.query.keyword) {
    filter.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { email: { $regex: req.query.keyword, $options: 'i' } },
      { username: { $regex: req.query.keyword, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc  Get single user detail
// @route GET /api/admin/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc  Update a user — full profile edit (name/username/email/phone/bio),
//        disable/enable (isActive), and role changes between seeker/owner.
//        All fields are optional; only what's sent gets changed.
// @route PUT /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be modified here');
  }

  const { name, username, email, phone, bio, isActive, role } = req.body;

  if (username && username.toLowerCase() !== user.username) {
    const taken = await User.findOne({ username: username.toLowerCase(), _id: { $ne: user._id } });
    if (taken) {
      res.status(409);
      throw new Error('Username is already taken');
    }
    user.username = username.toLowerCase();
  }

  if (email && email.toLowerCase() !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
    if (taken) {
      res.status(409);
      throw new Error('Email is already registered');
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (isActive !== undefined) user.isActive = isActive;
  if (role && ['seeker', 'owner'].includes(role)) user.role = role;

  const updated = await user.save();
  res.json({ success: true, user: updated.toSafeObject() });
});

// @desc  Soft-delete a user — hides them from the active user list and blocks
//        login (isActive is also turned off), but the record is kept and can
//        be brought back with restoreUser. Their existing listings/messages/
//        favorites are untouched.
// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be deleted here');
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.isActive = false;
  await user.save();

  res.json({ success: true, message: 'User deleted' });
});

// @desc  Restore a previously soft-deleted user — re-enables login too.
// @route PUT /api/admin/users/:id/restore
const restoreUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isDeleted = false;
  user.deletedAt = null;
  user.isActive = true;
  const updated = await user.save();

  res.json({ success: true, user: updated.toSafeObject() });
});

// @desc  Get all properties (admin - any status)
// @route GET /api/admin/properties
const getAllProperties = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.keyword) {
    filter.title = { $regex: req.query.keyword, $options: 'i' };
  }

  const properties = await Property.find(filter)
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 });

  res.json({ success: true, properties });
});

// @desc  Update a property's admin-controlled fields (approve/reject/feature/verify/fraud/etc)
// @route PUT /api/admin/properties/:id
const adminUpdateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  const allowedFields = ['status', 'isFeatured', 'isVerified', 'isFraud'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) property[field] = req.body[field];
  });

  const updated = await property.save();
  res.json({ success: true, property: updated });
});

// @desc  Delete any property
// @route DELETE /api/admin/properties/:id
const adminDeleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }
  await property.deleteOne();
  res.json({ success: true, message: 'Property deleted' });
});

// @desc  Get all reports
// @route GET /api/admin/reports  (also exposed as GET /api/reports for admins)
const getReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const reports = await Report.find(filter)
    .populate('reporter', 'name email')
    .populate('property', 'title location images owner')
    .sort({ createdAt: -1 });

  res.json({ success: true, reports });
});

// @desc  Update report status
// @route PUT /api/admin/reports/:id (also PUT /api/reports/:id)
const updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  if (req.body.status) report.status = req.body.status;
  const updated = await report.save();
  res.json({ success: true, report: updated });
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  restoreUser,
  getAllProperties,
  adminUpdateProperty,
  adminDeleteProperty,
  getReports,
  updateReport,
};
