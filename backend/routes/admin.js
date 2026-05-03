const express = require('express');
const { body } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const {
  listUsers,
  listTransactions,
  listDisputes,
  setTrustLevel,
  getStats,
  resolveDispute,
} = require('../controllers/adminController');
const { getReports, resolveReport } = require('../controllers/reportController');
const { getAllAmbassadors, payCommission } = require('../controllers/ambassadorController');

// Round 9 — Analytics helpers
const Listing     = require('../models/Listing');
const Transaction = require('../models/Transaction');
const Need        = require('../models/Need');
const User        = require('../models/User');
const Campus      = require('../models/Campus');

const router = express.Router();

// All admin routes require the X-Admin-Secret header
router.use(adminAuth);

// ── Existing routes ──────────────────────────────────────────────
router.get('/users', listUsers);
router.get('/transactions', listTransactions);
router.get('/disputes', listDisputes);
router.post('/disputes/:id/resolve', resolveDispute);
router.get('/stats', getStats);
router.put(
  '/users/:id/trust',
  [body('trustLevel').isInt({ min: 0, max: 3 }).withMessage('trustLevel must be 0–3')],
  setTrustLevel
);

// ── Round 8C — Reports ───────────────────────────────────────────
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);

// ── Round 9 — Ambassador management ─────────────────────────────
router.get('/ambassadors', getAllAmbassadors);
router.put('/ambassadors/:id/pay-commission', payCommission);

// ── Round 9 — Demand heatmap ─────────────────────────────────────
router.get('/analytics/demand-heatmap', async (req, res, next) => {
  try {
    const CATEGORIES = ['textbooks', 'electronics', 'formal-wear', 'cycles', 'hobby-gear', 'hostel-essentials'];

    // Per-category: needs count vs listings count
    const [needsByCategory, listingsByCategory] = await Promise.all([
      Need.aggregate([
        { $group: { _id: '$category', needsCount: { $sum: 1 } } },
      ]),
      Listing.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$category', listingsCount: { $sum: 1 } } },
      ]),
    ]);

    const needsMap    = Object.fromEntries(needsByCategory.map((r) => [r._id, r.needsCount]));
    const listingsMap = Object.fromEntries(listingsByCategory.map((r) => [r._id, r.listingsCount]));
    const byCategory  = CATEGORIES.map((cat) => ({
      category:      cat,
      needsCount:    needsMap[cat]    || 0,
      listingsCount: listingsMap[cat] || 0,
      gap:           (needsMap[cat] || 0) - (listingsMap[cat] || 0),
    }));

    // Per-campus stats
    const campuses = await Campus.find({ active: true }, 'name').lean();
    const byCampus = await Promise.all(
      campuses.map(async (campus) => {
        const [needsCount, listingsCount, activeUsers] = await Promise.all([
          Need.countDocuments({ campus: campus._id }),
          Listing.countDocuments({ campus: campus._id, status: 'active' }),
          User.countDocuments({ campus: campus._id }),
        ]);
        return { campusName: campus.name, needsCount, listingsCount, activeUsers };
      })
    );

    // Top 20 open needs
    const topNeeds = await Need.find()
      .select('title category maxBudget createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Conversion rate
    const [initiated, completed] = await Promise.all([
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'completed' }),
    ]);
    const conversionRate = initiated > 0 ? +((completed / initiated) * 100).toFixed(1) : 0;

    // Avg time to complete (escrowed → completed), in hours
    const completedTxns = await Transaction.find(
      { status: 'completed', escrowedAt: { $exists: true }, escrowReleasedAt: { $exists: true } },
      'escrowedAt escrowReleasedAt'
    ).lean();
    const avgTimeToComplete = completedTxns.length
      ? +(
          completedTxns.reduce(
            (sum, t) => sum + (new Date(t.escrowReleasedAt) - new Date(t.escrowedAt)),
            0
          ) / completedTxns.length / 3_600_000
        ).toFixed(1)
      : 0;

    // Weekly GMV for last 12 weeks
    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
    const weeklyData = await Transaction.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: twelveWeeksAgo } } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$createdAt' },
            week: { $isoWeek: '$createdAt' },
          },
          count:    { $sum: 1 },
          gmvPaise: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    res.json({
      success: true,
      byCategory,
      byCampus,
      topNeeds,
      conversionRate,
      avgTimeToComplete,
      semesterActivity: weeklyData,
    });
  } catch (err) {
    next(err);
  }
});

// ── Round 9 — Deep campus analytics ─────────────────────────────
router.get('/analytics/campus/:campusId', async (req, res, next) => {
  try {
    const { campusId } = req.params;

    const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      verifiedUsers,
      activeListings,
      completedTxns,
      gmvResult,
      topCategories,
      topSellers,
      disputeCount,
      weeklyGMV,
    ] = await Promise.all([
      User.countDocuments({ campus: campusId }),
      User.countDocuments({ campus: campusId, emailVerified: true }),
      Listing.countDocuments({ campus: campusId, status: 'active' }),
      Transaction.countDocuments({ campus: campusId, status: 'completed' }),
      Transaction.aggregate([
        { $match: { campus: require('mongoose').Types.ObjectId.createFromHexString(campusId), status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Listing.aggregate([
        { $match: { campus: require('mongoose').Types.ObjectId.createFromHexString(campusId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      User.find({ campus: campusId })
        .select('name completedTransactions averageRating')
        .sort({ completedTransactions: -1 })
        .limit(5)
        .lean(),
      Transaction.countDocuments({ campus: campusId, status: 'disputed' }),
      Transaction.aggregate([
        {
          $match: {
            campus: require('mongoose').Types.ObjectId.createFromHexString(campusId),
            status: 'completed',
            createdAt: { $gte: eightWeeksAgo },
          },
        },
        {
          $group: {
            _id: { year: { $isoWeekYear: '$createdAt' }, week: { $isoWeek: '$createdAt' } },
            gmvPaise: { $sum: '$amount' },
            count:    { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
      ]),
    ]);

    const totalInitiated = await Transaction.countDocuments({ campus: campusId });
    const disputeRate = totalInitiated > 0
      ? +((disputeCount / totalInitiated) * 100).toFixed(2)
      : 0;

    // Avg rating of sellers on this campus
    const ratingAgg = await User.aggregate([
      { $match: { campus: require('mongoose').Types.ObjectId.createFromHexString(campusId), totalRatings: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$averageRating' } } },
    ]);
    const avgRating = ratingAgg[0]?.avg ? +ratingAgg[0].avg.toFixed(2) : 0;

    res.json({
      success: true,
      campusId,
      totalUsers,
      verifiedUsers,
      activeListings,
      completedTransactions: completedTxns,
      totalGMVPaise: gmvResult[0]?.total || 0,
      topCategories,
      topSellers,
      disputeRate,
      avgRating,
      weeklyGMV,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
