function buildPropertyFilter(query) {
  const filter = {};

  if (query.purpose) filter.purpose = query.purpose;
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.furnished) filter.furnished = query.furnished === 'true';
  if (query.bedrooms) filter.bedrooms = { $gte: Number(query.bedrooms) };
  if (query.bathrooms) filter.bathrooms = { $gte: Number(query.bathrooms) };

  if (query.location) {
    filter.location = { $regex: query.location, $options: 'i' };
  }

  if (query.keyword) {
    filter.title = { $regex: query.keyword, $options: 'i' };
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.amenities) {
    const amenitiesArr = Array.isArray(query.amenities)
      ? query.amenities
      : query.amenities.split(',');
    filter.amenities = { $all: amenitiesArr };
  }

  return filter;
}

function buildSort(sortParam) {
  switch (sortParam) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

module.exports = { buildPropertyFilter, buildSort };
