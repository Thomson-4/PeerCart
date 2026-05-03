const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // Either listing OR need must be present (enforced in controller)
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
    need:    { type: mongoose.Schema.Types.ObjectId, ref: 'Need',    default: null },

    // Exactly 2 participants: buyer + seller
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      validate: {
        validator: (v) => v.length === 2,
        message: 'A conversation must have exactly 2 participants',
      },
    },

    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date },

    status: { type: String, enum: ['active', 'closed'], default: 'active' },

    // Linked once a transaction is initiated through this conversation
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },
  },
  { timestamps: true }
);

// Fast lookup: all conversations a user is part of
conversationSchema.index({ participants: 1 });
// Fast lookup: existing convo between listing + pair of users
conversationSchema.index({ listing: 1, participants: 1 });
// Fast lookup: existing convo between need + pair of users
conversationSchema.index({ need: 1, participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
