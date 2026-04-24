const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const Listing = require('../models/Listing');
const { notifyAdminListingFlagged } = require('../utils/notifications');

const AUTO_FLAG_THRESHOLD = 3; // reports before listing is put under-review

// ─── POST /api/reports ────────────────────────────────────────────
const createReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { listingId, reason, details } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // One report per user per listing (enforced by unique index too)
    const existing = await Report.findOne({ listing: listingId, reportedBy: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reported this listing' });
    }

    const report = await Report.create({
      listing:    listingId,
      reportedBy: req.user._id,
      reason,
      details,
    });

    // Count pending reports; auto-flag if threshold reached
    const pendingCount = await Report.countDocuments({ listing: listingId, status: 'pending' });
    if (pendingCount >= AUTO_FLAG_THRESHOLD) {
      await Listing.findByIdAndUpdate(listingId, { status: 'under-review' });
      notifyAdminListingFlagged(listingId, pendingCount);
    }

    res.status(201).json({ success: true, report });
  } catch (err) {
    // Handle duplicate key (race condition on the unique index)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reported this listing' });
    }
    next(err);
  }
};

// ─── GET /api/admin/reports ───────────────────────────────────────
const getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));

    const filter = {};
    if (status) filter.status = status;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('listing',    'title status images')
        .populate('reportedBy', 'name trustLevel phone')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Report.countDocuments(filter),
    ]);

    res.json({
      success: true,
      reports,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/admin/reports/:id ───────────────────────────────────
const resolveReport = async (req, res, next) => {
  try {
    const { status, action } = req.body;
    const report = await Report.findById(req.params.id).populate('listing');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (action === 'dismiss') {
      report.status = 'dismissed';
      // Restore listing if it was put under-review
      if (report.listing && report.listing.status === 'under-review') {
        await Listing.findByIdAndUpdate(report.listing._id, { status: 'active' });
      }
    } else if (action === 'remove') {
      report.status = 'actioned';
      if (report.listing) {
        await Listing.findByIdAndUpdate(report.listing._id, { status: 'expired' });
      }
    } else if (status) {
      report.status = status;
    }

    await report.save();
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReport, getReports, resolveReport };
