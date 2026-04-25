const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    emailDomain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // e.g. "rvce.edu.in"
    },
    city: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

campusSchema.index({ emailDomain: 1 }, { unique: true });

module.exports = mongoose.model('Campus', campusSchema);
