const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    buyer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    seller:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    campus:  { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },

    type:    { type: String, enum: ['buy', 'rent'], required: true },
    amount:  { type: Number, min: 0 }, // paise
    deposit: { type: Number, min: 0, default: 0 }, // paise — rentals only

    status: {
      type: String,
      enum: ['initiated', 'escrowed', 'completed', 'disputed', 'cancelled'],
      default: 'initiated',
    },

    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },

    escrowedAt:        { type: Date }, // set when payment captured
    escrowReleasedAt:  { type: Date },
    disputeRaisedAt:   { type: Date },
    disputeReason:     { type: String },

    // Rental-only fields
    rentalStartDate:      { type: Date },
    rentalEndDate:        { type: Date },
    returnConfirmedAt:    { type: Date },
  },
  { timestamps: true }
);

transactionSchema.index({ buyer: 1, createdAt: -1 });
transactionSchema.index({ seller: 1, createdAt: -1 });
transactionSchema.index({ razorpayOrderId: 1 }, { sparse: true });

module.exports = mongoose.model('Transaction', transactionSchema);
