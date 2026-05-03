const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { createReview } = require('../controllers/reviewController');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('transactionId').isMongoId().withMessage('Valid transaction ID required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 300 }).withMessage('Comment must be 300 characters or fewer'),
  ],
  createReview
);

module.exports = router;
