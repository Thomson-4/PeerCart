const { validationResult } = require('express-validator');
const Need = require('../models/Need');
const { matchNeedToListings } = require('../utils/matcher');
const { notifySellerOfMatch } = require('../utils/notifications');

const NEED_EXPIRY_DAYS = 7;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// POST /api/needs
const postNeed = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.user.campus) {
      return res.status(400).json({
        success: false,
        message: 'You must be assigned to a campus to post a need',
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + NEED_EXPIRY_DAYS);

    const need = await Need.create({
      ...req.body,
      postedBy: req.user._id,
      campus: req.user.campus,
      expiresAt,
    });

    // Fire-and-forget match + notify sellers
    matchNeedToListings(need)
      .then(({ sellerIds }) => sellerIds.forEach((id) => notifySellerOfMatch(id, need.title)))
      .catch((err) => console.error('[matcher] Error during matching:', err.message));

    res.status(201).json({ success: true, need });
  } catch (err) {
    next(err);
  }
};

// GET /api/needs
const getNeeds = async (req, res, next) => {
  try {
    if (!req.user.campus) {
      return res.status(400).json({ success: false, message: 'No campus assigned to your account' });
    }

    const { category, type, page = 1, limit = DEFAULT_LIMIT } = req.query;

    const filter = {
      campus: req.user.campus,
      status: 'open',
      expiresAt: { $gt: new Date() },
    };
    if (category) filter.category = category;
    if (type) filter.type = type;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT));
    const skip = (pageNum - 1) * limitNum;

    const [needs, total] = await Promise.all([
      Need.find(filter)
        .populate('postedBy', 'name avatar trustLevel')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Need.countDocuments(filter),
    ]);

    res.json({
      success: true,
      needs,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/needs/:id
const deleteNeed = async (req, res, next) => {
  try {
    const need = await Need.findById(req.params.id);

    if (!need) {
      return res.status(404).json({ success: false, message: 'Need not found' });
    }

    if (need.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to close this need' });
    }

    need.status = 'expired';
    await need.save();

    res.json({ success: true, message: 'Need closed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { postNeed, getNeeds, deleteNeed };
