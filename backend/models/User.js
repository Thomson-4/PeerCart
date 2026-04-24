const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // NOTE: unique constraint is managed via a partial index below (not schema-level).
    // Sparse indexes in MongoDB *do* index null values — only absent fields are excluded.
    // The partial index ($type:'string') fixes this: only real strings are ever indexed.
    phone: { type: String, trim: true },

    email: { type: String, trim: true, lowercase: true },
    emailVerified: { type: Boolean, default: false },

    studentIdPhoto: { type: String }, // Cloudinary URL

    trustLevel: { type: Number, default: 0, min: 0, max: 3 },

    campus: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },

    name: { type: String, trim: true },
    avatar: { type: String }, // Cloudinary URL

    completedTransactions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },

    // Round 6 — FCM push notifications
    fcmToken: { type: String, default: null },

    // Round 9 — Ambassador referral tracking
    referredBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralCode: { type: String, default: null }, // code used at signup

    // Password-based auth (hashed — never returned in API responses)
    password: { type: String, select: false },

    // Never returned in API responses (select: false)
    otp:                       { type: String, select: false },
    otpExpiry:                 { type: Date,   select: false },
    emailVerificationToken:    { type: String, select: false },
    emailVerificationExpiry:   { type: Date,   select: false },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
// Partial indexes only index documents where the field is an actual string.
// This means phone:null, phone:undefined, and missing phone are all ignored —
// multiple email-only users can coexist without any unique conflicts.
userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } }
);
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);

// ── Pre-save: strip null/empty phone & email so they're always absent ──────────
userSchema.pre('save', function () {
  if (this.phone === null || this.phone === '') this.set('phone', undefined);
  if (this.email === null || this.email === '') this.set('email', undefined);
});

module.exports = mongoose.model('User', userSchema);
