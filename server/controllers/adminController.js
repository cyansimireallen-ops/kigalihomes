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

// @desc  Get all users (search/filter)
// @route GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const filter = { role: { $ne: 'admin' } };
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

// @desc  Update user (disable/restore, change role between seeker/owner)
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

  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  if (req.body.role && ['seeker', 'owner'].includes(req.body.role)) {
    user.role = req.body.role;
  }

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
  getAllProperties,
  adminUpdateProperty,
  adminDeleteProperty,
  getReports,
  updateReport,
};
