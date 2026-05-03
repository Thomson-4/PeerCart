const mongoose = require('mongoose');

const REASONS = ['fake-item', 'wrong-price', 'scam', 'inappropriate', 'duplicate', 'already-sold', 'other'];

const reportSchema = new mongoose.Schema(
  {
    listing:    { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

    reason:  { type: String, enum: REASONS, required: true },
    details: { type: String, maxlength: 500, trim: true },

    status: {
      type: String,
      enum: ['pending', 'reviewed', 'actioned', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

reportSchema.index({ listing: 1, status: 1 });
// Prevent duplicate reports from same user on same listing
reportSchema.index({ listing: 1, reportedBy: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
