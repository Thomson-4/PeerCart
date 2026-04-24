const mongoose = require('mongoose');

const CATEGORIES = ['textbooks', 'electronics', 'formal-wear', 'cycles', 'hobby-gear', 'hostel-essentials'];

const needSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true },

    category: { type: String, required: true, enum: CATEGORIES },
    maxBudget: { type: Number, min: 0 }, // paise; optional
    type: { type: String, enum: ['buy', 'rent'], required: true },

    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    campus: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },

    status: { type: String, enum: ['open', 'fulfilled', 'expired'], default: 'open' },

    expiresAt: { type: Date }, // auto-set to +7 days in controller
  },
  { timestamps: true }
);

needSchema.index({ campus: 1, status: 1, expiresAt: 1 });
needSchema.index({ campus: 1, category: 1, status: 1 });

module.exports = mongoose.model('Need', needSchema);
