const asyncHandler = require('../middleware/asyncHandler');
const Property = require('../models/Property');
const { buildPropertyFilter, buildSort } = require('../utils/apiFeatures');

// @desc  Get properties (public - only approved & not fraud, with filters/search/pagination)
// @route GET /api/properties
const getProperties = asyncHandler(async (req, res) => {
  const filter = buildPropertyFilter(req.query);
  filter.status = { $in: ['approved', 'sold', 'rented'] };
  filter.isFraud = false;

  const sort = buildSort(req.query.sort);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate('owner', 'name phone role')
      .sort({ isFeatured: -1, ...sort })
      .skip(skip)
      .limit(limit),
    Property.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: properties.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    properties,
  });
});

// @desc  Get properties for the homepage's "Featured Properties" section.
//        Prefers listings an admin has explicitly marked Featured; if there are
//        none yet, falls back to the newest approved listings so the homepage
//        isn't empty the moment a listing gets approved (before anyone has had
//        a chance to feature it).
// @route GET /api/properties/featured
const getFeaturedProperties = asyncHandler(async (req, res) => {
  let properties = await Property.find({
    isFeatured: true,
    status: 'approved',
    isFraud: false,
  })
    .populate('owner', 'name phone')
    .sort({ createdAt: -1 })
    .limit(8);

  if (properties.length === 0) {
    properties = await Property.find({ status: 'approved', isFraud: false })
      .populate('owner', 'name phone')
      .sort({ createdAt: -1 })
      .limit(8);
  }

  res.json({ success: true, properties });
});

// @desc  Get single property (and increment views), plus similar properties
// @route GET /api/properties/:id
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    'owner',
    'name phone email role profileImage'
  );

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  property.views += 1;
  await property.save();

  const similar = await Property.find({
    _id: { $ne: property._id },
    location: property.location,
    status: 'approved',
    isFraud: false,
  }).limit(4);

  res.json({ success: true, property, similar });
});

// @desc  Create property listing (owner/agent). Status starts as 'pending'.
// @route POST /api/properties
const createProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    purpose,
    propertyType,
    price,
    location,
    address,
    bedrooms,
    bathrooms,
    size,
    furnished,
    amenities,
    contactPhone,
  } = req.body;

  if (!title || !description || !purpose || !propertyType || !price || !location || !contactPhone) {
    res.status(400);
    throw new Error('Please fill in all required property fields');
  }

  const images = (req.files?.images || []).map((f) => `/uploads/${f.filename}`);
  const video = req.files?.video?.[0] ? `/uploads/${req.files.video[0].filename}` : '';

  // Admins adding a listing themselves (no agent involved) act as their own point of
  // contact, so their listings publish immediately instead of waiting on approval.
  // Anyone else's listing still starts as "pending" until an admin reviews it.
  const isAdminCreated = req.user.role === 'admin';

  const property = await Property.create({
    title,
    description,
    purpose,
    propertyType,
    price,
    location,
    address,
    bedrooms: bedrooms || 0,
    bathrooms: bathrooms || 0,
    size: size || 0,
    furnished: furnished === 'true' || furnished === true,
    amenities: amenities
      ? Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim())
      : [],
    images,
    video,
    contactPhone,
    owner: req.user._id,
    status: isAdminCreated ? 'approved' : 'pending',
    isVerified: isAdminCreated,
  });

  res.status(201).json({ success: true, property });
});

// @desc  Update own property (owner) or any property (admin)
// @route PUT /api/properties/:id
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  const isOwner = property.owner.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this property');
  }

  const editableFields = [
    'title',
    'description',
    'purpose',
    'propertyType',
    'price',
    'location',
    'address',
    'bedrooms',
    'bathrooms',
    'size',
    'furnished',
    'amenities',
    'contactPhone',
    'status',
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'amenities' && typeof req.body.amenities === 'string') {
        property.amenities = req.body.amenities.split(',').map((a) => a.trim());
      } else {
        property[field] = req.body[field];
      }
    }
  });

  // A non-admin editing their listing resets it back to pending review.
  // Admins editing (their own or anyone's) keep it published — they're the review authority.
  if (isOwner && req.user.role !== 'admin') {
    property.status = 'pending';
  }

  if (req.files?.images?.length > 0) {
    const newImages = req.files.images.map((f) => `/uploads/${f.filename}`);
    property.images = [...property.images, ...newImages].slice(0, 10);
  }

  if (req.files?.video?.[0]) {
    property.video = `/uploads/${req.files.video[0].filename}`;
  } else if (req.body.removeVideo === 'true') {
    property.video = '';
  }

  const updated = await property.save();
  res.json({ success: true, property: updated });
});

// @desc  Delete own property (owner) or any property (admin)
// @route DELETE /api/properties/:id
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  const isOwner = property.owner.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this property');
  }

  await property.deleteOne();
  res.json({ success: true, message: 'Property deleted' });
});

// @desc  Get properties owned by the logged-in user
// @route GET /api/properties/mine/all
const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, properties });
});

module.exports = {
  getProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
};
