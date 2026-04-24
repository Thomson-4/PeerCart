const Ambassador = require('../models/Ambassador');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// ─── POST /api/ambassador/apply ───────────────────────────────────
const apply = async (req, res, next) => {
  try {
    const existing = await Ambassador.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You are already a campus ambassador',
        referralCode: existing.referralCode,
      });
    }

    if (!req.user.campus) {
      return res.status(400).json({ success: false, message: 'You must be assigned to a campus first' });
    }

    const ambassador = await Ambassador.create({
      user:     req.user._id,
      campus:   req.user.campus,
      joinedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to the Ambassador Programme!',
      referralCode: ambassador.referralCode,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/ambassador/dashboard ───────────────────────────────
const dashboard = async (req, res, next) => {
  try {
    const ambassador = await Ambassador.findOne({ user: req.user._id })
      .populate('referredUsers', 'name createdAt completedTransactions');

    if (!ambassador) {
      return res.status(404).json({ success: false, message: 'You are not an ambassador yet' });
    }

    const topReferrals = (ambassador.referredUsers || [])
      .sort((a, b) => b.completedTransactions - a.completedTransactions)
      .slice(0, 5)
      .map((u) => ({
        name:             u.name,
        joinedAt:         u.createdAt,
        transactionCount: u.completedTransactions,
      }));

    res.json({
      success: true,
      dashboard: {
        referralCode:          ambassador.referralCode,
        referredUsersCount:    ambassador.referredUsers.length,
        totalGMVDrivenPaise:   ambassador.totalGMVDrivenPaise,
        commissionEarnedPaise: ambassador.commissionEarnedPaise,
        commissionPaidPaise:   ambassador.commissionPaidPaise,
        pendingCommissionPaise: ambassador.commissionEarnedPaise - ambassador.commissionPaidPaise,
        topReferrals,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/ambassadors ───────────────────────────────────
const getAllAmbassadors = async (req, res, next) => {
  try {
    const ambassadors = await Ambassador.find()
      .populate('user',   'name phone email trustLevel')
      .populate('campus', 'name')
      .sort({ totalGMVDrivenPaise: -1 });

    res.json({ success: true, ambassadors });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/admin/ambassadors/:id/pay-commission ───────────────
const payCommission = async (req, res, next) => {
  try {
    const { amountPaise } = req.body;
    if (!amountPaise || amountPaise <= 0) {
      return res.status(400).json({ success: false, message: 'amountPaise must be a positive integer' });
    }

    const ambassador = await Ambassador.findById(req.params.id);
    if (!ambassador) {
      return res.status(404).json({ success: false, message: 'Ambassador not found' });
    }

    const pending = ambassador.commissionEarnedPaise - ambassador.commissionPaidPaise;
    if (amountPaise > pending) {
      return res.status(400).json({
        success: false,
        message: `Cannot pay more than pending commission (Rs ${pending / 100})`,
        pendingPaise: pending,
      });
    }

    ambassador.commissionPaidPaise += amountPaise;
    await ambassador.save();

    console.log(`[ambassador] Commission paid: Rs ${amountPaise / 100} to ambassador ${ambassador._id}`);
    res.json({ success: true, ambassador });
  } catch (err) {
    next(err);
  }
};

module.exports = { apply, dashboard, getAllAmbassadors, payCommission };
