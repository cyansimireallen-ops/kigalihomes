const asyncHandler = require('../middleware/asyncHandler');
const Report = require('../models/Report');
const Property = require('../models/Property');

// @desc  Report a property listing
// @route POST /api/reports
const createReport = asyncHandler(async (req, res) => {
  const { property, reason, description } = req.body;

  if (!property || !reason) {
    res.status(400);
    throw new Error('Please select a property and a reason');
  }

  const exists = await Property.findById(property);
  if (!exists) {
    res.status(404);
    throw new Error('Property not found');
  }

  const report = await Report.create({
    reporter: req.user._id,
    property,
    reason,
    description,
  });

  res.status(201).json({ success: true, report });
});

// @desc  Get logged-in user's own submitted reports
// @route GET /api/reports/mine
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ reporter: req.user._id })
    .populate('property', 'title location images')
    .sort({ createdAt: -1 });
  res.json({ success: true, reports });
});

module.exports = { createReport, getMyReports };
