const mongoose = require('mongoose');

const CATEGORIES = ['textbooks', 'electronics', 'formal-wear', 'cycles', 'hobby-gear', 'hostel-essentials'];
const CONDITIONS = ['new', 'like-new', 'good', 'fair'];

const listingSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true },

    price:     { type: Number, required: true, min: 0 }, // stored in paise
    condition: { type: String, required: true, enum: CONDITIONS },
    category:  { type: String, required: true, enum: CATEGORIES },

    type: { type: String, enum: ['sell', 'rent'], default: 'sell' },

    // Rent-only fields — enforced at controller level
    rentalDeposit:      { type: Number, min: 0 },  // paise
    rentalDurationDays: { type: Number, min: 1 },

    images: {
      type: [String],
      validate: { validator: (v) => v.length <= 5, message: 'Maximum 5 images allowed' },
      default: [],
    },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    campus: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },

    // Rent urgency — buyer signals they need this soon
    urgent: { type: Boolean, default: false },

    // Round 8A — Live capture enforcement
    liveCaptureVerified: { type: Boolean, default: false },
    photoTakenAt:        { type: Date,    default: null },
    photoLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // Round 8D — Listing expiry & renewal
    renewalCount: { type: Number, default: 0, max: 3 },
    expiresAt:    { type: Date },

    status: {
      type: String,
      enum: ['active', 'sold', 'rented', 'expired', 'under-review'],
      default: 'active',
    },

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Most-used query shapes
listingSchema.index({ campus: 1, status: 1, createdAt: -1 });
listingSchema.index({ campus: 1, category: 1, status: 1 });
listingSchema.index({ campus: 1, type: 1, status: 1 });
listingSchema.index({ expiresAt: 1, status: 1 }); // for expiry job

module.exports = mongoose.model('Listing', listingSchema);
