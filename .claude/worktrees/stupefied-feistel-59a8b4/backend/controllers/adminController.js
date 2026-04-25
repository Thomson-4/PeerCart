const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Transaction = require('../models/Transaction');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const paginate = (query) => {
  const pageNum = Math.max(1, parseInt(query.page) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
};

// GET /api/admin/users
const listUsers = async (req, res, next) => {
  try {
    const { trustLevel, campus } = req.query;
    const { pageNum, limitNum, skip } = paginate(req.query);

    const filter = {};
    if (trustLevel != null) filter.trustLevel = Number(trustLevel);
    if (campus) filter.campus = campus;

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('campus', 'name emailDomain city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/transactions
const listTransactions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const { pageNum, limitNum, skip } = paginate(req.query);

    const filter = {};
    if (status) filter.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('buyer', 'name phone')
        .populate('seller', 'name phone')
        .populate('listing', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/disputes
const listDisputes = async (req, res, next) => {
  try {
    const { pageNum, limitNum, skip } = paginate(req.query);
    const filter = { status: 'disputed' };

    const [disputes, total] = await Promise.all([
      Transaction.find(filter)
        .populate('buyer', 'name phone')
        .populate('seller', 'name phone')
        .populate('listing', 'title')
        .sort({ disputeRaisedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      disputes,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/trust
const setTrustLevel = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { trustLevel: Number(req.body.trustLevel) },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    console.log(`[admin] Trust level for user ${req.params.id} manually set to ${user.trustLevel}`);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalListings, totalTransactions, gmvResult, disputeCount, campusBreakdown] =
      await Promise.all([
        User.countDocuments(),
        Listing.countDocuments(),
        Transaction.countDocuments(),
        Transaction.aggregate([
          { $match: { status: { $in: ['escrowed', 'completed'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.countDocuments({ status: 'disputed' }),
        User.aggregate([
          { $group: { _id: '$campus', count: { $sum: 1 } } },
          {
            $lookup: {
              from: 'campuses',
              localField: '_id',
              foreignField: '_id',
              as: 'campus',
            },
          },
          { $unwind: { path: '$campus', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              name: { $ifNull: ['$campus.name', 'Unassigned'] },
              count: 1,
            },
          },
          { $sort: { count: -1 } },
        ]),
      ]);

    const totalGMVPaise = gmvResult[0]?.total ?? 0;
    const disputeRate =
      totalTransactions > 0
        ? Math.round((disputeCount / totalTransactions) * 10000) / 100 // percentage, 2dp
        : 0;

    res.json({
      success: true,
      stats: { totalUsers, totalListings, totalTransactions, totalGMVPaise, disputeRate, campusBreakdown },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, listTransactions, listDisputes, setTrustLevel, getStats };
