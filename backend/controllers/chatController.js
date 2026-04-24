const { validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Listing = require('../models/Listing');
const { notifyNewMessage } = require('../utils/notifications');

// ─── POST /api/chat/conversations ────────────────────────────────
// Creates or returns existing conversation between logged-in user
// and the listing's seller. Trust Level 1+ required.
const createOrGetConversation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { listingId } = req.body;
    const buyerId = req.user._id;

    const listing = await Listing.findById(listingId);
    if (!listing || listing.status === 'expired') {
      return res.status(404).json({ success: false, message: 'Listing not found or unavailable' });
    }

    if (listing.seller.toString() === buyerId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot start a conversation with yourself' });
    }

    const sellerId = listing.seller;

    // Return existing conversation if one already exists for this listing + pair
    const existing = await Conversation.findOne({
      listing: listingId,
      participants: { $all: [buyerId, sellerId] },
    })
      .populate('listing', 'title images price type')
      .populate('participants', 'name avatar trustLevel');

    if (existing) {
      return res.json({ success: true, conversation: existing });
    }

    const conversation = await Conversation.create({
      listing: listingId,
      participants: [buyerId, sellerId],
    });

    await conversation.populate('listing', 'title images price type');
    await conversation.populate('participants', 'name avatar trustLevel');

    res.status(201).json({ success: true, conversation });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/chat/conversations ─────────────────────────────────
// All conversations for the logged-in user, sorted newest first.
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('listing', 'title images price type status')
      .populate('participants', 'name avatar trustLevel')
      .sort({ lastMessageAt: -1, createdAt: -1 });

    res.json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/chat/conversations/:id/messages ─────────────────────
// Paginated messages for a conversation. Marks unread as read.
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip  = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ conversation: req.params.id })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversation: req.params.id }),
    ]);

    // Mark all unread messages (sent by the other party) as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user._id },
        readAt: null,
      },
      { $set: { readAt: new Date() } }
    );

    res.json({
      success: true,
      messages: messages.reverse(), // return chronological order
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/chat/conversations/:id/messages ────────────────────
// Send a message. Participants only. Updates conversation preview.
const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (conversation.status === 'closed') {
      return res.status(400).json({ success: false, message: 'This conversation is closed' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { content } = req.body;

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content,
    });

    await message.populate('sender', 'name avatar');

    // Update conversation preview
    const preview = content.length > 80 ? content.slice(0, 80) + '…' : content;
    conversation.lastMessage = preview;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Notify the other participant
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );
    if (recipientId) {
      notifyNewMessage(recipientId, req.user.name || 'Someone', preview);
    }

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/chat/unread-count ───────────────────────────────────
// Total unread messages across all conversations for the user.
const getUnreadCount = async (req, res, next) => {
  try {
    // Find all conversations this user is in
    const conversations = await Conversation.find(
      { participants: req.user._id },
      '_id'
    );
    const conversationIds = conversations.map((c) => c._id);

    const count = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user._id },
      readAt: null,
    });

    res.json({ success: true, unreadCount: count });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrGetConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
};
