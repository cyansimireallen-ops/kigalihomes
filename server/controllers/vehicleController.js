const asyncHandler = require('../middleware/asyncHandler');
const Vehicle = require('../models/Vehicle');

// Builds a Mongo filter object from query params — kept local to this controller
// (rather than a shared utility) so this module doesn't depend on assumptions
// about property-specific filter-building code elsewhere in the project.
function buildVehicleFilter(query) {
  const filter = {};
  if (query.purpose) filter.purpose = query.purpose;
  if (query.vehicleType) filter.vehicleType = query.vehicleType;
  if (query.condition) filter.condition = query.condition;
  if (query.location) filter.location = { $regex: query.location, $options: 'i' };
  if (query.make) filter.make = { $regex: query.make, $options: 'i' };
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.minYear) filter.year = { ...(filter.year || {}), $gte: Number(query.minYear) };
  if (query.keyword) {
    filter.$or = [
      { title: { $regex: query.keyword, $options: 'i' } },
      { make: { $regex: query.keyword, $options: 'i' } },
      { model: { $regex: query.keyword, $options: 'i' } },
    ];
  }
  return filter;
}

function buildSort(sortParam) {
  switch (sortParam) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    default:
      return { createdAt: -1 };
  }
}

// @desc  Get vehicles (public - only approved & not fraud, with filters/search/pagination)
// @route GET /api/vehicles
const getVehicles = asyncHandler(async (req, res) => {
  const filter = buildVehicleFilter(req.query);
  filter.status = { $in: ['approved', 'sold', 'rented'] };
  filter.isFraud = false;

  const sort = buildSort(req.query.sort);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const skip = (page - 1) * limit;

  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter)
      .populate('owner', 'name phone role')
      .sort({ isFeatured: -1, ...sort })
      .skip(skip)
      .limit(limit),
    Vehicle.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: vehicles.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    vehicles,
  });
});

// @desc  Featured vehicles for a homepage/browse-page banner. Falls back to the
//        newest approved vehicles if nothing has been marked Featured yet.
// @route GET /api/vehicles/featured
const getFeaturedVehicles = asyncHandler(async (req, res) => {
  let vehicles = await Vehicle.find({ isFeatured: true, status: 'approved', isFraud: false })
    .populate('owner', 'name phone')
    .sort({ createdAt: -1 })
    .limit(8);

  if (vehicles.length === 0) {
    vehicles = await Vehicle.find({ status: 'approved', isFraud: false })
      .populate('owner', 'name phone')
      .sort({ createdAt: -1 })
      .limit(8);
  }

  res.json({ success: true, vehicles });
});

// @desc  Get single vehicle (and increment views), plus similar vehicles
// @route GET /api/vehicles/:id
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate(
    'owner',
    'name phone email role profileImage'
  );

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  vehicle.views += 1;
  await vehicle.save();

  const similar = await Vehicle.find({
    _id: { $ne: vehicle._id },
    vehicleType: vehicle.vehicleType,
    status: 'approved',
    isFraud: false,
  }).limit(4);

  res.json({ success: true, vehicle, similar });
});

// @desc  Create vehicle listing (owner/agent/admin). Status starts as 'pending'
//        unless created by an admin, same rule as property listings.
// @route POST /api/vehicles
const createVehicle = asyncHandler(async (req, res) => {
  const {
    title, description, purpose, vehicleType, make, model, year, mileage,
    transmission, fuelType, condition, price, location, district, sector, cell, village,
    features, contactPhone,
  } = req.body;

  if (!title || !description || !purpose || !vehicleType || !make || !model || !year || !price || !location || !contactPhone) {
    res.status(400);
    throw new Error('Please fill in all required vehicle fields');
  }

  const address = [village, cell, sector, district].filter(Boolean).join(', ');
  const images = req.uploadedImages || [];
  const video = req.uploadedVideo || '';
  const isAdminCreated = req.user.role === 'admin';

  const vehicle = await Vehicle.create({
    title,
    description,
    purpose,
    vehicleType,
    make,
    model,
    year,
    mileage: mileage || 0,
    transmission: transmission || 'n/a',
    fuelType: fuelType || 'n/a',
    condition: condition || 'used',
    price,
    location,
    address,
    district: district || '',
    sector: sector || '',
    cell: cell || '',
    village: village || '',
    features: features
      ? Array.isArray(features)
        ? features
        : features.split(',').map((f) => f.trim())
      : [],
    images,
    video,
    contactPhone,
    owner: req.user._id,
    status: isAdminCreated ? 'approved' : 'pending',
    isVerified: isAdminCreated,
  });

  res.status(201).json({ success: true, vehicle });
});

// @desc  Update own vehicle (owner) or any vehicle (admin)
// @route PUT /api/vehicles/:id
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const isOwner = vehicle.owner.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this vehicle');
  }

  const editableFields = [
    'title', 'description', 'purpose', 'vehicleType', 'make', 'model', 'year', 'mileage',
    'transmission', 'fuelType', 'condition', 'price', 'location', 'district', 'sector', 'cell', 'village',
    'features', 'contactPhone', 'status',
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'features' && typeof req.body.features === 'string') {
        vehicle.features = req.body.features.split(',').map((f) => f.trim());
      } else {
        vehicle[field] = req.body[field];
      }
    }
  });

  if (['district', 'sector', 'cell', 'village'].some((f) => req.body[f] !== undefined)) {
    vehicle.address = [vehicle.village, vehicle.cell, vehicle.sector, vehicle.district]
      .filter(Boolean)
      .join(', ');
  }

  if (isOwner && req.user.role !== 'admin') {
    vehicle.status = 'pending';
  }

  if (req.uploadedImages?.length > 0) {
    vehicle.images = [...vehicle.images, ...req.uploadedImages].slice(0, 10);
  }

  if (req.uploadedVideo) {
    vehicle.video = req.uploadedVideo;
  } else if (req.body.removeVideo === 'true') {
    vehicle.video = '';
  }

  const updated = await vehicle.save();
  res.json({ success: true, vehicle: updated });
});

// @desc  Delete own vehicle (owner) or any vehicle (admin)
// @route DELETE /api/vehicles/:id
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const isOwner = vehicle.owner.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this vehicle');
  }

  await vehicle.deleteOne();
  res.json({ success: true, message: 'Vehicle deleted' });
});

// @desc  Get vehicles owned by the logged-in user
// @route GET /api/vehicles/mine/all
const getMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, vehicles });
});

module.exports = {
  getVehicles,
  getFeaturedVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getMyVehicles,
};
