const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  createOrGetConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { requireTrust } = require('../middleware/trust');

const router = express.Router();

// 60 messages per user per minute
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.user?._id?.toString() ?? req.ip,
  message: { success: false, message: 'Too many messages — slow down' },
  skip: (req) => !req.user,
});

router.use(protect);

// Create or fetch conversation (trust level 1+ to initiate)
// Body: { listingId } OR { needId }
router.post(
  '/conversations',
  requireTrust(1),
  [
    body('listingId').optional().isMongoId().withMessage('listingId must be a valid ID'),
    body('needId').optional().isMongoId().withMessage('needId must be a valid ID'),
  ],
  createOrGetConversation
);

// List all conversations for logged-in user
router.get('/conversations', getConversations);

// Messages in a specific conversation
router.get('/conversations/:id/messages', getMessages);

// Send a message
router.post(
  '/conversations/:id/messages',
  messageLimiter,
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Message content is required')
      .isLength({ max: 1000 })
      .withMessage('Message cannot exceed 1000 characters'),
  ],
  sendMessage
);

// Notification badge count
router.get('/unread-count', getUnreadCount);

module.exports = router;
