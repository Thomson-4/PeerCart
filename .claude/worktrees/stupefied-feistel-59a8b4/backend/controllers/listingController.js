const { validationResult } = require('express-validator');
const Listing = require('../models/Listing');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_RENEWALS = 3;

const requireCampus = (user, res) => {
  if (!user.campus) {
    res.status(400).json({ success: false, message: 'You must be assigned to a campus before accessing listings' });
    return false;
  }
  return true;
};

// POST /api/listings
const createListing = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!requireCampus(req.user, res)) return;

    // Rent listings require Level 2 (Level 1 can only sell)
    if (req.body.type === 'rent' && req.user.trustLevel < 2) {
      return res.status(403).json({
        success: false,
        message: 'Trust Level 2 required to list items for rent',
        currentTrustLevel: req.user.trustLevel,
        requiredTrustLevel: 2,
      });
    }

    // Live capture: encouraged but not mandatory for demo
    // liveCaptureVerified=true sets photoTakenAt and marks the listing as verified
    const liveCaptureVerified = req.body.liveCaptureVerified === true;

    const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);

    const listing = await Listing.create({
      ...req.body,
      seller: req.user._id,
      campus: req.user.campus,
      liveCaptureVerified,
      photoTakenAt: liveCaptureVerified ? new Date() : null,
      expiresAt,
    });

    res.status(201).json({ success: true, listing });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings
const getListings = async (req, res, next) => {
  try {
    if (!requireCampus(req.user, res)) return;

    const { category, type, minPrice, maxPrice, condition, mine, page = 1, limit = DEFAULT_LIMIT } = req.query;

    const filter = mine === 'true'
      ? { seller: req.user._id }
      : { campus: req.user.campus, status: 'active' };

    if (category)  filter.category  = category;
    if (type)      filter.type      = type;
    if (condition) filter.condition = condition;
    if (minPrice != null || maxPrice != null) {
      filter.price = {};
      if (minPrice != null) filter.price.$gte = Number(minPrice);
      if (maxPrice != null) filter.price.$lte = Number(maxPrice);
    }

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT));
    const skip     = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'name avatar trustLevel averageRating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Listing.countDocuments(filter),
    ]);

    res.json({
      success: true,
      listings,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/:id
const getListing = async (req, res, next) => {
  try {
    if (!requireCampus(req.user, res)) return;

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'name avatar trustLevel averageRating');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.campus.toString() !== req.user.campus.toString()) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.json({ success: true, listing });
  } catch (err) {
    next(err);
  }
};

// PUT /api/listings/:id
const updateListing = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this listing' });
    }

    // Strip fields that must never change after creation
    const { seller, campus, type, liveCaptureVerified, renewalCount, ...updates } = req.body;

    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, listing: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/listings/:id
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this listing' });
    }

    await listing.deleteOne();
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/listings/:id/renew   — Round 8D
const renewListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to renew this listing' });
    }

    if (listing.renewalCount >= MAX_RENEWALS) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_RENEWALS} renewals reached. Please create a new listing.`,
      });
    }

    listing.status      = 'active';
    listing.renewalCount += 1;
    listing.expiresAt   = new Date(Date.now() + THIRTY_DAYS_MS);
    // Touch updatedAt so the expiry job resets its 30-day window
    listing.markModified('status');
    await listing.save();

    res.json({
      success: true,
      message: `Listing renewed (${listing.renewalCount}/${MAX_RENEWALS} renewals used)`,
      listing,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createListing, getListings, getListing, updateListing, deleteListing, renewListing };
