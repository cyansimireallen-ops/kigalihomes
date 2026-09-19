const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    purpose: { type: String, enum: ['rent', 'sale'], required: true },
    vehicleType: {
      type: String,
      enum: ['car', 'motorcycle', 'truck', 'bus', 'van', 'other'],
      required: true,
    },
    make: { type: String, required: true, trim: true }, // e.g. Toyota, Honda
    model: { type: String, required: true, trim: true }, // e.g. RAV4, CB150
    year: { type: Number, required: true },
    mileage: { type: Number, default: 0 }, // kilometers
    transmission: { type: String, enum: ['automatic', 'manual', 'n/a'], default: 'n/a' },
    fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid', 'n/a'], default: 'n/a' },
    condition: { type: String, enum: ['new', 'used'], default: 'used' },
    price: { type: Number, required: true, min: 0 },

    location: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    district: { type: String, default: '' },
    sector: { type: String, default: '' },
    cell: { type: String, default: '' },
    village: { type: String, default: '' },

    features: [{ type: String }], // e.g. AC, Bluetooth, Backup Camera
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

vehicleSchema.index({ title: 'text', make: 'text', model: 'text', location: 'text' });
vehicleSchema.index({ purpose: 1, vehicleType: 1, status: 1 });
vehicleSchema.index({ price: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
