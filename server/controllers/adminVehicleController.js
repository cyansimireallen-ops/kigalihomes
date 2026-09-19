const asyncHandler = require('../middleware/asyncHandler');
const Vehicle = require('../models/Vehicle');

// @desc  Get all vehicles (admin - any status)
// @route GET /api/admin/vehicles
const getAllVehicles = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.keyword) {
    filter.$or = [
      { title: { $regex: req.query.keyword, $options: 'i' } },
      { make: { $regex: req.query.keyword, $options: 'i' } },
      { model: { $regex: req.query.keyword, $options: 'i' } },
    ];
  }

  const vehicles = await Vehicle.find(filter).populate('owner', 'name phone').sort({ createdAt: -1 });
  res.json({ success: true, vehicles });
});

// @desc  Admin update (approve/reject/feature/verify/mark fraud/edit)
// @route PUT /api/admin/vehicles/:id
const adminUpdateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const allowedFields = [
    'status', 'isFeatured', 'isVerified', 'isFraud', 'title', 'description', 'price',
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) vehicle[field] = req.body[field];
  });

  const updated = await vehicle.save();
  res.json({ success: true, vehicle: updated });
});

// @desc  Admin delete any vehicle
// @route DELETE /api/admin/vehicles/:id
const adminDeleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  await vehicle.deleteOne();
  res.json({ success: true, message: 'Vehicle deleted' });
});

module.exports = { getAllVehicles, adminUpdateVehicle, adminDeleteVehicle };
