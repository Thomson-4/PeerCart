const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    // message | escrow | release | dispute | match | transaction
    type: {
      type:     String,
      enum:     ['message', 'escrow', 'release', 'dispute', 'match', 'transaction'],
      required: true,
    },
    title: { type: String, required: true, maxlength: 100 },
    body:  { type: String, required: true, maxlength: 300 },
    read:  { type: Boolean, default: false },
    // optional frontend route to navigate to when the notification is tapped
    link:  { type: String, default: null },
  },
  { timestamps: true }
);

// compound index so "get my notifications, newest first" is fast
notificationSchema.index({ recipient: 1, createdAt: -1 });
// fast unread-count query
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
