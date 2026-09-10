const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    purpose: { type: String, enum: ['rent', 'sale'], required: true },
    propertyType: {
      type: String,
      enum: ['house', 'apartment', 'villa', 'commercial', 'plot'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    district: { type: String, default: '' },
    sector: { type: String, default: '' },
    cell: { type: String, default: '' },
    village: { type: String, default: '' },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    size: { type: Number, default: 0 }, // square meters
    furnished: { type: Boolean, default: false },
    amenities: [{ type: String }],
    images: [{ type: String }],
    video: { type: String, default: '' },
    contactPhone: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'sold', 'rented'],
      default: 'pending',
    },
    isFeatured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isFraud: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', location: 'text' });
propertySchema.index({ purpose: 1, propertyType: 1, status: 1 });
propertySchema.index({ price: 1 });

module.exports = mongoose.model('Property', propertySchema);
