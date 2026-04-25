const express = require('express');
const { body } = require('express-validator');
const { sendOtp, verifyOtp, verifyEmail, confirmEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// E.164-ish phone number: optional +, then 10–15 digits
const phoneValidator = body('phone')
  .trim()
  .matches(/^\+?[1-9]\d{9,14}$/)
  .withMessage('Valid phone number required (10–15 digits)');

router.post('/send-otp', [phoneValidator], sendOtp);

router.post(
  '/verify-otp',
  [
    phoneValidator,
    body('otp')
      .trim()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('6-digit numeric OTP required'),
  ],
  verifyOtp
);

// Protected: user must be logged in to add a college email
router.post(
  '/verify-email',
  protect,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email address required')],
  verifyEmail
);

// Public: triggered by clicking the link in the verification email
router.get('/confirm-email/:token', confirmEmail);

module.exports = router;
