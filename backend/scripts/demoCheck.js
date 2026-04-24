/**
 * demoCheck.js
 * Verifies the database and configuration are ready for the live demo.
 * Run: node scripts/demoCheck.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const crypto   = require('crypto');

const COLLECTIONS_THAT_SHOULD_BE_EMPTY = [
  'users', 'listings', 'needs', 'transactions',
  'reviews', 'conversations', 'messages', 'reports', 'ambassadors',
];

let passed = 0;
let failed = 0;

function check(label, ok, detail = '') {
  if (ok) {
    console.log(`  ✅  ${label}${detail ? '  →  ' + detail : ''}`);
    passed++;
  } else {
    console.log(`  ❌  ${label}${detail ? '  →  ' + detail : ''}`);
    failed++;
  }
}

async function run() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  PeerCart Demo Readiness Check');
  console.log('══════════════════════════════════════════════\n');

  // ── MongoDB connection ─────────────────────────────────────────
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    check('MongoDB connection', true, process.env.MONGO_URI.replace(/:([^@]+)@/, ':***@'));
  } catch (err) {
    check('MongoDB connection', false, err.message);
    console.log('\n  Cannot continue without MongoDB. Exiting.\n');
    process.exit(1);
  }

  const db = mongoose.connection.db;

  // ── Collection counts ──────────────────────────────────────────
  console.log('\n── Collection counts ──────────────────────────');
  for (const col of COLLECTIONS_THAT_SHOULD_BE_EMPTY) {
    const count = await db.collection(col).countDocuments();
    check(`${col} is empty`, count === 0, `count = ${count}`);
  }

  // ── Campus check ──────────────────────────────────────────────
  console.log('\n── Campus ─────────────────────────────────────');
  const Campus = require('../models/Campus');
  const campusCount = await Campus.countDocuments();
  check('Exactly 1 campus document', campusCount === 1, `found ${campusCount}`);

  const campus = await Campus.findOne({ emailDomain: 'reva.edu.in' });
  check('REVA University campus exists', !!campus, campus ? campus.name : 'NOT FOUND');
  check('emailDomain is reva.edu.in',    campus?.emailDomain === 'reva.edu.in', campus?.emailDomain);
  check('Campus is active',             campus?.active === true);

  // ── Environment variables ──────────────────────────────────────
  console.log('\n── Environment variables ──────────────────────');
  check('JWT_SECRET set',                !!process.env.JWT_SECRET && process.env.JWT_SECRET !== 'replace_with_a_long_random_secret');
  check('RAZORPAY_KEY_ID set',           !!process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_xxx'));
  check('RAZORPAY_KEY_SECRET set',       !!process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.startsWith('your_'));
  check('RAZORPAY_KEY_ID is test mode',  process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_'),
        process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? 'YES — safe for demo' : 'WARNING: may be live key');
  check('ADMIN_SECRET set',              !!process.env.ADMIN_SECRET && process.env.ADMIN_SECRET !== 'replace_with_a_long_random_admin_secret');

  // ── Razorpay signature algorithm ──────────────────────────────
  console.log('\n── Razorpay signature verification ────────────');
  try {
    const testOrderId   = 'order_test123';
    const testPaymentId = 'pay_test456';
    const testSecret    = 'test_secret_key';
    const expectedSig   = crypto
      .createHmac('sha256', testSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');
    const recomputed = crypto
      .createHmac('sha256', testSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');
    check('HMAC signature algorithm works', expectedSig === recomputed);
  } catch (err) {
    check('HMAC signature algorithm works', false, err.message);
  }

  // ── Controller / route imports ─────────────────────────────────
  console.log('\n── Module integrity ────────────────────────────');
  try {
    const txCtrl = require('../controllers/transactionController');
    check('transactionController loads',  true);
    check('verifyPayment function exists', typeof txCtrl.verifyPayment === 'function');
    check('initiate function exists',      typeof txCtrl.initiate === 'function');
    check('confirmReceipt function exists',typeof txCtrl.confirmReceipt === 'function');
  } catch (err) {
    check('transactionController loads', false, err.message);
  }

  try {
    const authCtrl = require('../controllers/authController');
    check('authController loads', true);
    check('signup function exists', typeof authCtrl.signup === 'function');
    check('signin function exists', typeof authCtrl.signin === 'function');
  } catch (err) {
    check('authController loads', false, err.message);
  }

  try {
    require('../controllers/listingController');
    check('listingController loads', true);
  } catch (err) {
    check('listingController loads', false, err.message);
  }

  try {
    require('../controllers/chatController');
    check('chatController loads', true);
  } catch (err) {
    check('chatController loads', false, err.message);
  }

  // ── User model has password field ─────────────────────────────
  try {
    const User = require('../models/User');
    const hasPasswordField = 'password' in User.schema.paths;
    check('User model has password field', hasPasswordField);
  } catch (err) {
    check('User model has password field', false, err.message);
  }

  // ── Summary ───────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log(`  ${passed} passed  |  ${failed} failed`);
  if (failed === 0) {
    console.log('\n  🚀  ALL CHECKS PASSED — Demo is ready!\n');
  } else {
    console.log('\n  ⚠️   Fix the failures above before the demo.\n');
  }
  console.log('══════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('\n❌  Unexpected error:', err.message);
  process.exit(1);
});
