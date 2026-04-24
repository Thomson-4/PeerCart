const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { requireTrust } = require('../middleware/trust');
const {
  initiate,
  verifyPayment,
  webhook,
  confirmReceipt,
  raiseDispute,
  myTransactions,
} = require('../controllers/transactionController');

const router = express.Router();

router.post(
  '/initiate',
  protect,
  requireTrust(1),
  [
    body('listingId').isMongoId().withMessage('Valid listing ID required'),
    body('type').isIn(['buy', 'rent']).withMessage('type must be buy or rent'),
    body('rentalStartDate').optional().isISO8601().withMessage('Valid ISO date required'),
    body('rentalEndDate').optional().isISO8601().withMessage('Valid ISO date required'),
  ],
  initiate
);

// Frontend calls this after Razorpay checkout.js returns payment data
router.post(
  '/verify-payment',
  protect,
  [
    body('razorpay_order_id').notEmpty().withMessage('razorpay_order_id is required'),
    body('razorpay_payment_id').notEmpty().withMessage('razorpay_payment_id is required'),
    body('razorpay_signature').notEmpty().withMessage('razorpay_signature is required'),
  ],
  verifyPayment
);

// Public — Razorpay posts here; signature-verified inside the controller
router.post('/webhook', webhook);

router.post(
  '/:id/raise-dispute',
  protect,
  [body('reason').trim().notEmpty().withMessage('Dispute reason is required')],
  raiseDispute
);

// GET before /:id routes to avoid "my" being treated as an ObjectId param
router.get('/my', protect, myTransactions);

router.post('/:id/confirm-receipt', protect, confirmReceipt);

module.exports = router;
