const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // sparse: true allows multiple documents with no phone (email-only signups)
    phone: { type: String, unique: true, sparse: true, trim: true },

    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
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

module.exports = mongoose.model('User', userSchema);
