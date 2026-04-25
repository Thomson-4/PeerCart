const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { requireTrust } = require('../middleware/trust');

const router = express.Router();

// 5 reports per user per hour
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?._id?.toString() ?? req.ip,
  message: { success: false, message: 'Too many reports — please wait before reporting again' },
  skip: (req) => !req.user,
});

const REASONS = ['fake-item', 'wrong-price', 'scam', 'inappropriate', 'duplicate', 'already-sold', 'other'];

router.use(protect);

router.post(
  '/',
  requireTrust(1),
  reportLimiter,
  [
    body('listingId').notEmpty().withMessage('listingId is required'),
    body('reason').isIn(REASONS).withMessage(`reason must be one of: ${REASONS.join(', ')}`),
    body('details').optional().isLength({ max: 500 }).withMessage('details max 500 chars'),
  ],
  createReport
);

module.exports = router;
