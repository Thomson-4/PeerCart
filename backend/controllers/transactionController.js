const crypto = require('crypto');
const Razorpay = require('razorpay');
const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Ambassador = require('../models/Ambassador');
const { checkTrustProgression } = require('../utils/trustProgression');
const {
  notifyBuyerEscrowConfirmed,
  notifySellerEscrowReleased,
  notifyDisputeRaised,
} = require('../utils/notifications');

// Lazily instantiate Razorpay so missing keys don't crash the server on startup
let _razorpay = null;
const getRazorpay = () => {
  if (_razorpay) return _razorpay;
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.startsWith('rzp_test_xxx')) {
    return null; // keys not configured → fall back to mock
  }
  _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _razorpay;
};

// Level 1 cap: Rs 1500 = 150 000 paise
const LEVEL_1_CAP_PAISE = 150_000;
// Level 2 cap: Rs 10 000 = 1 000 000 paise
const LEVEL_2_CAP_PAISE = 1_000_000;
// 48-hour escrow auto-release window
const ESCROW_RELEASE_MS = 48 * 60 * 60 * 1000;
// Dispute window: 24 hours from escrow
const DISPUTE_WINDOW_MS = 24 * 60 * 60 * 1000;
// Ambassador commission rate: 2%
const AMBASSADOR_COMMISSION_RATE = 0.02;

// ─── Round 8E daily transaction limits by trust level ────────────
const DAILY_LIMITS = { 1: 3, 2: 10 };

const startOfTodayIST = () => {
  // IST = UTC+5:30
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);
  const midnightIST = new Date(nowIST);
  midnightIST.setUTCHours(0, 0, 0, 0);
  return new Date(midnightIST.getTime() - istOffset); // back to UTC
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const releaseEscrow = async (transactionId) => {
  const t = await Transaction.findById(transactionId);
  if (!t || t.status !== 'escrowed') return;

  t.status = 'completed';
  t.escrowReleasedAt = new Date();
  await t.save();

  await User.findByIdAndUpdate(t.seller, { $inc: { completedTransactions: 1 } });
  await checkTrustProgression(t.seller);

  notifySellerEscrowReleased(t.seller, t.amount);
  console.log(`[escrow] Auto-released: Rs ${t.amount / 100} to seller ${t.seller} (txn ${transactionId})`);
};

const scheduleEscrowRelease = (transactionId) => {
  // WARNING: setTimeout is not durable — does not survive server restarts.
  // Replace with Bull/BullMQ or a persistent job queue in production.
  setTimeout(() => releaseEscrow(transactionId), ESCROW_RELEASE_MS);
};

// ─── Ambassador commission ────────────────────────────────────────
const creditAmbassadorCommission = async (buyerId, transactionAmount) => {
  try {
    const buyer = await User.findById(buyerId).select('referredBy').lean();
    if (!buyer?.referredBy) return;

    const ambassador = await Ambassador.findOne({ user: buyer.referredBy, active: true });
    if (!ambassador) return;

    const commission = Math.round(transactionAmount * AMBASSADOR_COMMISSION_RATE);
    ambassador.totalGMVDrivenPaise   += transactionAmount;
    ambassador.commissionEarnedPaise += commission;
    await ambassador.save();

    console.log(`[ambassador] Commission earned: Rs ${commission / 100} for ambassador ${ambassador._id}`);
  } catch (err) {
    console.error('[ambassador] Commission credit failed:', err.message);
  }
};

// ------------------------------------------------------------------
// POST /api/transactions/initiate
// ------------------------------------------------------------------
const initiate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { listingId, type, rentalStartDate, rentalEndDate } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing || listing.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Listing not found or not available' });
    }

    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot buy your own listing' });
    }

    // Campus isolation
    if (listing.campus.toString() !== req.user.campus?.toString()) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Validate rental-specific requirements
    if (type === 'rent') {
      if (listing.type !== 'rent') {
        return res.status(400).json({ success: false, message: 'This listing is not available for rent' });
      }
      if (!rentalStartDate || !rentalEndDate) {
        return res.status(400).json({
          success: false,
          message: 'rentalStartDate and rentalEndDate are required for rent transactions',
        });
      }
      const start = new Date(rentalStartDate);
      const end   = new Date(rentalEndDate);
      if (end <= start) {
        return res.status(400).json({ success: false, message: 'rentalEndDate must be after rentalStartDate' });
      }
    }

    const amount  = listing.price;
    const deposit = type === 'rent' ? (listing.rentalDeposit || 0) : 0;
    const total   = amount + deposit;

    // Trust level caps
    if (req.user.trustLevel === 1 && total > LEVEL_1_CAP_PAISE) {
      return res.status(403).json({
        success: false,
        message: `Trust Level 1 allows transactions up to ₹${LEVEL_1_CAP_PAISE / 100}. Upgrade to Level 2 for higher-value items.`,
        totalPaise: total,
        capPaise: LEVEL_1_CAP_PAISE,
      });
    }
    if (req.user.trustLevel === 2 && total > LEVEL_2_CAP_PAISE) {
      return res.status(403).json({
        success: false,
        message: `Trust Level 2 allows transactions up to ₹${LEVEL_2_CAP_PAISE / 100}. Upgrade to Level 3 for higher-value items.`,
        totalPaise: total,
        capPaise: LEVEL_2_CAP_PAISE,
      });
    }

    // Round 8E — Daily transaction limits by trust level
    const dailyLimit = DAILY_LIMITS[req.user.trustLevel];
    if (dailyLimit !== undefined) {
      const todayStart = startOfTodayIST();
      const todayCount = await Transaction.countDocuments({
        buyer:     req.user._id,
        createdAt: { $gte: todayStart },
      });
      if (todayCount >= dailyLimit) {
        return res.status(429).json({
          success: false,
          message: 'Daily transaction limit reached. Upgrade your trust level for more.',
          dailyLimit,
          usedToday: todayCount,
        });
      }
    }

    // ── Create Razorpay order ────────────────────────────────────────
    let razorpayOrderId;
    const razorpay = getRazorpay();

    if (razorpay) {
      // Real Razorpay SDK call
      const order = await razorpay.orders.create({
        amount:   total,           // paise
        currency: 'INR',
        receipt:  `pc_${Date.now()}`,
        notes: {
          listingId: listing._id.toString(),
          buyerId:   req.user._id.toString(),
          sellerId:  listing.seller.toString(),
        },
      });
      razorpayOrderId = order.id;
      console.log(`[Razorpay] Created order ${razorpayOrderId} for ₹${total / 100}`);
    } else {
      // Fallback mock (dev with placeholder keys)
      razorpayOrderId = `order_mock_${Date.now()}`;
      console.log(`[MOCK Razorpay] Created order ${razorpayOrderId} for ₹${total / 100}`);
    }

    const transaction = await Transaction.create({
      listing: listing._id,
      buyer:   req.user._id,
      seller:  listing.seller,
      campus:  listing.campus,
      type,
      amount,
      deposit,
      razorpayOrderId,
      ...(type === 'rent' && {
        rentalStartDate: new Date(rentalStartDate),
        rentalEndDate:   new Date(rentalEndDate),
      }),
    });

    res.status(201).json({
      success: true,
      transaction,
      payment: {
        orderId:       razorpayOrderId,
        amount:        total,   // paise
        currency:      'INR',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// POST /api/transactions/webhook  (public — Razorpay calls this)
// ------------------------------------------------------------------
const webhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature     = req.headers['x-razorpay-signature'];

    if (webhookSecret) {
      if (!signature) {
        return res.status(400).json({ success: false, message: 'Missing webhook signature' });
      }
      const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.rawBody)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    } else {
      console.warn('[webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification');
    }

    const event = req.body;
    if (event.event !== 'payment.captured') {
      return res.json({ success: true });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id) {
      return res.status(400).json({ success: false, message: 'Malformed webhook payload' });
    }

    const transaction = await Transaction.findOne({ razorpayOrderId: payment.order_id });
    if (!transaction) {
      console.warn(`[webhook] No transaction found for order ${payment.order_id}`);
      return res.json({ success: true });
    }

    if (transaction.status !== 'initiated') {
      return res.json({ success: true });
    }

    transaction.status           = 'escrowed';
    transaction.razorpayPaymentId = payment.id;
    transaction.escrowedAt        = new Date();
    await transaction.save();

    await Listing.findByIdAndUpdate(transaction.listing, {
      status: transaction.type === 'rent' ? 'rented' : 'sold',
    });

    scheduleEscrowRelease(transaction._id);
    notifyBuyerEscrowConfirmed(transaction.buyer, transaction.amount);

    console.log(`[webhook] Escrowed txn ${transaction._id} (${payment.order_id})`);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// POST /api/transactions/:id/confirm-receipt
// ------------------------------------------------------------------
const confirmReceipt = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer can confirm receipt' });
    }

    if (transaction.status !== 'escrowed') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm receipt — transaction is ${transaction.status}`,
      });
    }

    transaction.status           = 'completed';
    transaction.escrowReleasedAt = new Date();
    await transaction.save();

    await User.findByIdAndUpdate(transaction.seller, { $inc: { completedTransactions: 1 } });
    await checkTrustProgression(transaction.seller);

    // Round 9 — Credit ambassador commission if buyer was referred
    await creditAmbassadorCommission(transaction.buyer, transaction.amount);

    notifySellerEscrowReleased(transaction.seller, transaction.amount);
    console.log(`[escrow] Released Rs ${transaction.amount / 100} to seller ${transaction.seller} (txn ${transaction._id})`);

    res.json({ success: true, message: 'Receipt confirmed. Escrow released to seller.', transaction });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// POST /api/transactions/:id/raise-dispute
// ------------------------------------------------------------------
const raiseDispute = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const isParty =
      transaction.buyer.toString()  === req.user._id.toString() ||
      transaction.seller.toString() === req.user._id.toString();

    if (!isParty) {
      return res.status(403).json({ success: false, message: 'Not a party to this transaction' });
    }

    if (transaction.status !== 'escrowed') {
      return res.status(400).json({
        success: false,
        message: `Disputes can only be raised on escrowed transactions (current: ${transaction.status})`,
      });
    }

    const escrowedAt = transaction.escrowedAt || transaction.updatedAt;
    if (Date.now() - escrowedAt.getTime() > DISPUTE_WINDOW_MS) {
      return res.status(400).json({
        success: false,
        message: 'Dispute window has closed (24 hours from escrow)',
      });
    }

    transaction.status           = 'disputed';
    transaction.disputeRaisedAt  = new Date();
    transaction.disputeReason    = req.body.reason;
    await transaction.save();

    notifyDisputeRaised(transaction.seller, transaction.buyer, transaction._id);
    console.log(`[dispute] Txn ${transaction._id} disputed by user ${req.user._id}`);

    res.json({ success: true, message: 'Dispute raised. Support team will review.', transaction });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// GET /api/transactions/my
// ------------------------------------------------------------------
const myTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const filter = { $or: [{ buyer: req.user._id }, { seller: req.user._id }] };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('listing', 'title images price category type')
        .populate('buyer',   'name avatar')
        .populate('seller',  'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// POST /api/transactions/verify-payment
// Called by frontend after Razorpay checkout.js returns payment data
// ------------------------------------------------------------------
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'razorpay_order_id, razorpay_payment_id and razorpay_signature are all required',
      });
    }

    // ── Verify signature ─────────────────────────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Allow mock orders through in dev (no real key secret configured)
    const isMockOrder = razorpay_order_id.startsWith('order_mock_');
    if (!isMockOrder && keySecret && !keySecret.startsWith('your_razorpay')) {
      const expected = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))) {
        console.warn(`[Razorpay] Signature mismatch for order ${razorpay_order_id}`);
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    } else if (isMockOrder) {
      console.log(`[MOCK Razorpay] Skipping signature check for mock order ${razorpay_order_id}`);
    }

    // ── Find the transaction ─────────────────────────────────────
    const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found for this order' });
    }

    // Ensure the request came from the buyer
    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    if (transaction.status !== 'initiated') {
      // Already processed (idempotent)
      return res.json({ success: true, transactionId: transaction._id, message: 'Already processed' });
    }

    // ── Escrow the payment ───────────────────────────────────────
    transaction.status            = 'escrowed';
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.escrowedAt        = new Date();
    await transaction.save();

    // Mark listing as sold/rented
    await Listing.findByIdAndUpdate(transaction.listing, {
      status: transaction.type === 'rent' ? 'rented' : 'sold',
    });

    // Schedule auto-release after 48h (non-durable, server restart resets timer)
    scheduleEscrowRelease(transaction._id);

    notifyBuyerEscrowConfirmed(transaction.buyer, transaction.amount);

    console.log(`[Razorpay] Payment verified & escrowed: txn ${transaction._id}, payment ${razorpay_payment_id}`);

    res.json({
      success:       true,
      transactionId: transaction._id,
      message:       'Payment verified. Funds are in escrow.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { initiate, verifyPayment, webhook, confirmReceipt, raiseDispute, myTransactions };
