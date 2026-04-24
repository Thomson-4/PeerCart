const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { sendOtp, verifyOtp, verifyEmail, confirmEmail, sendEmailOtp, verifyEmailOtp, signup, signin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// 5 OTP requests per phone per 15 minutes
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body?.phone ?? req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests — please wait 15 minutes and try again' },
  skipFailedRequests: false,
});

// 5 OTP requests per email per 15 minutes
const emailOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body?.email ?? req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests — please wait 15 minutes and try again' },
  skipFailedRequests: false,
});

const router = express.Router();

// E.164-ish phone number: optional +, then 10–15 digits
const phoneValidator = body('phone')
  .trim()
  .matches(/^\+?[1-9]\d{9,14}$/)
  .withMessage('Valid phone number required (10–15 digits)');

router.post('/send-otp', otpLimiter, [phoneValidator], sendOtp);

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

// Protected: returns the logged-in user's profile
router.get('/me', protect, (req, res) => {
  const u = req.user;
  res.json({
    success: true,
    user: {
      id:                   u._id,
      phone:                u.phone,
      name:                 u.name,
      email:                u.email,
      emailVerified:        u.emailVerified,
      avatar:               u.avatar,
      trustLevel:           u.trustLevel,
      completedTransactions: u.completedTransactions,
      averageRating:        u.averageRating,
      campus:               u.campus,
      createdAt:            u.createdAt,
    },
  });
});

// Protected: user must be logged in to add a college email
router.post(
  '/verify-email',
  protect,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email address required')],
  verifyEmail
);

// Public: triggered by clicking the link in the verification email
router.get('/confirm-email/:token', confirmEmail);

// ── College email sign-in / sign-up ──────────────────────────────────────────
// Step 1: send OTP to college email (validates domain against known campuses)
router.post(
  '/send-email-otp',
  emailOtpLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email address required')],
  sendEmailOtp
);

// Step 2: verify OTP → returns JWT at Trust Level 1 (domain already validated)
router.post(
  '/verify-email-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email address required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage('6-digit numeric OTP required'),
  ],
  verifyEmailOtp
);

// ── Password-based signup / signin ──────────────────────────────────────────
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => req.ip,
  message: { success: false, message: 'Too many signup attempts — try again in an hour' },
});

const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  keyGenerator: (req) => req.body?.identifier ?? req.ip,
  message: { success: false, message: 'Too many signin attempts — please wait 15 minutes' },
});

router.post(
  '/signup',
  signupLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
    body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').optional({ checkFalsy: true }).trim().matches(/^\+?[1-9]\d{9,14}$/).withMessage('Valid phone required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((val, { req: r }) => {
      if (val !== r.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  ],
  signup
);

router.post(
  '/signin',
  signinLimiter,
  [
    body('identifier').trim().notEmpty().withMessage('Email or phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  signin
);

module.exports = router;
