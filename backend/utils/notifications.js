/**
 * Notification utility — Round 6 + in-app notifications
 * Each function:
 *   1. Persists a Notification doc in MongoDB (in-app bell)
 *   2. Sends an FCM push if a token is available
 * Never throws — notification failures must never crash the server.
 */

const { sendPushNotification } = require('../config/firebase');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Persist an in-app notification.
 * Silently swallowed on error so callers never crash.
 */
const createNotification = async (recipientId, type, title, body, link = null) => {
  try {
    await Notification.create({ recipient: recipientId, type, title, body, link });
  } catch (err) {
    console.error('[notify] DB write failed:', err.message);
  }
};

/**
 * Fetch FCM token for a user ID. Returns null if not found.
 */
const getToken = async (userId) => {
  try {
    const user = await User.findById(userId).select('fcmToken').lean();
    return user?.fcmToken ?? null;
  } catch {
    return null;
  }
};

// ── Round 5 ─────────────────────────────────────────────────────
const notifyNewMessage = async (recipientId, senderName, messagePreview, conversationId) => {
  const preview = messagePreview.length > 50 ? messagePreview.slice(0, 50) + '…' : messagePreview;
  const token = await getToken(recipientId);
  console.log(`[notify] New message from ${senderName} → ${recipientId}: "${preview}"`);
  const link = conversationId ? `/messages/${conversationId}` : '/messages';
  await Promise.all([
    createNotification(recipientId, 'message', `New message from ${senderName}`, preview, link),
    sendPushNotification(token, senderName, preview, { type: 'message', screen: 'Chat' }),
  ]);
};

// ── Round 6 (replacing original stubs) ──────────────────────────
const notifySellerOfMatch = async (sellerId, needTitle) => {
  const token = await getToken(sellerId);
  console.log(`[notify] Seller ${sellerId}: new need matched — "${needTitle}"`);
  await Promise.all([
    createNotification(sellerId, 'match', 'Someone needs what you have!', `A student posted: ${needTitle}`, '/feed'),
    sendPushNotification(token, 'Someone needs what you have!', `A student posted: ${needTitle}`, { type: 'match', screen: 'MyListings' }),
  ]);
};

const notifySellerOfTransaction = async (sellerId, buyerName, listingTitle, transactionId) => {
  const body = `${buyerName} wants to buy "${listingTitle}"`;
  const token = await getToken(sellerId);
  console.log(`[notify] Seller ${sellerId}: new transaction — ${body}`);
  const link = transactionId ? `/orders` : '/orders';
  await Promise.all([
    createNotification(sellerId, 'transaction', 'New purchase request!', body, link),
    sendPushNotification(token, 'New purchase request!', body, { type: 'transaction', screen: 'MyTransactions' }),
  ]);
};

const notifyBuyerEscrowConfirmed = async (buyerId, amountPaise) => {
  const token = await getToken(buyerId);
  const amount = (amountPaise / 100).toLocaleString('en-IN');
  console.log(`[notify] Buyer ${buyerId}: payment escrowed — Rs ${amount}`);
  await Promise.all([
    createNotification(buyerId, 'escrow', 'Payment confirmed ✓', `₹${amount} is held safely in escrow`, '/orders'),
    sendPushNotification(token, 'Payment confirmed', `Your payment of Rs ${amount} is held safely in escrow`, { type: 'escrow', screen: 'MyTransactions' }),
  ]);
};

const notifySellerEscrowReleased = async (sellerId, amountPaise) => {
  const token = await getToken(sellerId);
  const amount = (amountPaise / 100).toLocaleString('en-IN');
  console.log(`[notify] Seller ${sellerId}: escrow released — Rs ${amount}`);
  await Promise.all([
    createNotification(sellerId, 'release', '💸 Money released!', `₹${amount} has been transferred to your account`, '/orders'),
    sendPushNotification(token, 'Money released!', `Rs ${amount} has been transferred to your account`, { type: 'release', screen: 'MyTransactions' }),
  ]);
};

const notifyDisputeRaised = async (sellerId, buyerId, transactionId) => {
  const [sellerToken, buyerToken] = await Promise.all([getToken(sellerId), getToken(buyerId)]);
  console.log(`[notify] Dispute on txn ${transactionId} — seller: ${sellerId}, buyer: ${buyerId}`);
  const link = '/orders';
  await Promise.all([
    createNotification(sellerId, 'dispute', 'Dispute raised', 'A dispute has been raised on your transaction', link),
    createNotification(buyerId,  'dispute', 'Dispute raised', 'A dispute has been raised on your transaction', link),
    sendPushNotification(sellerToken, 'Dispute raised', 'A dispute has been raised on your transaction', { type: 'dispute', screen: 'Disputes', transactionId: String(transactionId) }),
    sendPushNotification(buyerToken,  'Dispute raised', 'A dispute has been raised on your transaction', { type: 'dispute', screen: 'Disputes', transactionId: String(transactionId) }),
  ]);
};

// ── Round 8 ─────────────────────────────────────────────────────
const notifyAdminListingFlagged = (listingId, reportCount) => {
  // TODO: Email admin in production
  console.log(`[ALERT] Listing ${listingId} has ${reportCount} reports — flagged for review`);
};

module.exports = {
  createNotification,
  notifyNewMessage,
  notifySellerOfMatch,
  notifySellerOfTransaction,
  notifyBuyerEscrowConfirmed,
  notifySellerEscrowReleased,
  notifyDisputeRaised,
  notifyAdminListingFlagged,
};
