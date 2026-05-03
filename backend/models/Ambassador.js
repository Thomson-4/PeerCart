const mongoose = require('mongoose');
const crypto = require('crypto');

const ambassadorSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true, unique: true },
    campus: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },

    referralCode: {
      type: String,
      // unique index declared below via schema.index()
    },

    referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // All monetary values stored in paise
    totalGMVDrivenPaise:   { type: Number, default: 0 },
    commissionEarnedPaise: { type: Number, default: 0 },
    commissionPaidPaise:   { type: Number, default: 0 },

    active:   { type: Boolean, default: true },
    joinedAt: { type: Date,    default: Date.now },
  },
  { timestamps: true }
);

// Generate referral code before saving if not already set
ambassadorSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars
  }
  next();
});

ambassadorSchema.index({ referralCode: 1 }, { unique: true });
ambassadorSchema.index({ campus: 1, totalGMVDrivenPaise: -1 });

module.exports = mongoose.model('Ambassador', ambassadorSchema);
