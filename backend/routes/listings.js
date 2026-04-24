const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  renewListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const { requireTrust } = require('../middleware/trust');
const { suggestPrice } = require('../utils/priceSuggestion');
const { validationResult } = require('express-validator');

const router = express.Router();

const CATEGORIES = ['textbooks', 'electronics', 'formal-wear', 'cycles', 'hobby-gear', 'hostel-essentials'];
const CONDITIONS = ['new', 'like-new', 'good', 'fair'];
const TYPES = ['sell', 'rent'];
const STATUSES = ['active', 'sold', 'rented', 'expired'];

// 10 price-suggestion requests per user per hour (Round 7)
const priceSuggestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() ?? req.ip,
  message: { success: false, message: 'Too many price suggestion requests — try again later' },
  skip: (req) => !req.user,
});

const createValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isInt({ min: 0 }).withMessage('Price must be a non-negative integer (paise)'),
  body('condition').isIn(CONDITIONS).withMessage(`condition must be one of: ${CONDITIONS.join(', ')}`),
  body('category').isIn(CATEGORIES).withMessage(`category must be one of: ${CATEGORIES.join(', ')}`),
  body('type').optional().isIn(TYPES).withMessage(`type must be one of: ${TYPES.join(', ')}`),
  body('rentalDeposit').optional().isInt({ min: 0 }).withMessage('rentalDeposit must be a non-negative integer (paise)'),
  body('rentalDurationDays').optional().isInt({ min: 1 }).withMessage('rentalDurationDays must be at least 1'),
  body('images').optional().isArray({ max: 5 }).withMessage('Maximum 5 images allowed'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
  body('liveCaptureVerified').optional().isBoolean(),
];

const updateValidators = [
  body('title').optional().trim().notEmpty().isLength({ max: 120 }),
  body('description').optional().trim().notEmpty(),
  body('price').optional().isInt({ min: 0 }).withMessage('Price must be a non-negative integer (paise)'),
  body('condition').optional().isIn(CONDITIONS),
  body('status').optional().isIn(STATUSES),
  body('images').optional().isArray({ max: 5 }).withMessage('Maximum 5 images allowed'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
];

// All listing routes require authentication
router.use(protect);

// Round 7 — AI price suggestion (must be BEFORE /:id routes)
router.post(
  '/suggest-price',
  requireTrust(1),
  priceSuggestLimiter,
  [
    body('title').trim().notEmpty().withMessage('title is required'),
    body('description').trim().notEmpty().withMessage('description is required'),
    body('category').isIn(CATEGORIES).withMessage('invalid category'),
    body('condition').isIn(CONDITIONS).withMessage('invalid condition'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const result = await suggestPrice(req.body);
      if (!result) {
        return res.status(503).json({
          success: false,
          message: 'Price suggestion unavailable, please set your own price',
        });
      }

      // Convert rupees → paise for consistency with the rest of the API
      res.json({
        success: true,
        minPrice:        Math.round(result.minPrice * 100),
        maxPrice:        Math.round(result.maxPrice * 100),
        suggestedPrice:  Math.round(result.suggestedPrice * 100),
        reasoning:       result.reasoning,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/', requireTrust(1), createValidators, createListing);
router.get('/', getListings);
router.get('/:id', getListing);
router.put('/:id', updateValidators, updateListing);
router.delete('/:id', deleteListing);

// Round 8D — renew an expired/active listing (owner only, max 3 times)
router.post('/:id/renew', renewListing);

module.exports = router;
