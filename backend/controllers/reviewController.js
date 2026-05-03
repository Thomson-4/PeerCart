const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Recalculate a user's averageRating and totalRatings from all their reviews
const recalculateRating = async (userId) => {
  const [stats] = await Review.aggregate([
    { $match: { reviewee: userId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await User.findByIdAndUpdate(userId, {
    averageRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
    totalRatings: stats ? stats.count : 0,
  });
};

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { transactionId, rating, comment } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed transactions',
      });
    }

    const reviewerId = req.user._id;
    const buyerId = transaction.buyer.toString();
    const sellerId = transaction.seller.toString();
    const reviewerStr = reviewerId.toString();

    if (reviewerStr !== buyerId && reviewerStr !== sellerId) {
      return res.status(403).json({ success: false, message: 'You were not part of this transaction' });
    }

    // Buyer reviews seller; seller reviews buyer
    const revieweeId = reviewerStr === buyerId ? transaction.seller : transaction.buyer;

    const review = await Review.create({
      transaction: transaction._id,
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment,
    });

    await recalculateRating(revieweeId);

    res.status(201).json({ success: true, review });
  } catch (err) {
    // Duplicate key = reviewer already submitted a review for this transaction
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this transaction',
      });
    }
    next(err);
  }
};

module.exports = { createReview };
