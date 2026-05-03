const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');

const router = express.Router();

// GET /api/users/:id — public profile
// Returns safe user fields + their active listings + reviews they received
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar trustLevel averageRating totalRatings completedTransactions createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [listings, reviews] = await Promise.all([
      Listing.find({ seller: req.params.id, status: 'active' })
        .select('title price type category images condition createdAt')
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      Review.find({ reviewee: req.params.id })
        .populate('reviewer', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    res.json({ success: true, user, listings, reviews });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
