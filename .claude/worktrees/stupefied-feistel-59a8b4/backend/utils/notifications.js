/**
 * Notification utility — Round 6
 * All functions look up the recipient's FCM token and send a real push.
 * Falls back to console.log if Firebase is not configured.
 * Never throws — notification failures must never crash the server.
 */

const { sendPushNotification } = require('../config/firebase');
const User = require('../models/User');

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
const notifyNewMessage = async (recipientId, senderName, messagePreview) => {
  const preview = messagePreview.length > 50 ? messagePreview.slice(0, 50) + '…' : messagePreview;
  const token = await getToken(recipientId);
  console.log(`[notify] New message from ${senderName} → ${recipientId}: "${preview}"`);
  await sendPushNotification(token, senderName, preview, { type: 'message', screen: 'Chat' });
};

// ── Round 6 (replacing original stubs) ──────────────────────────
const notifySellerOfMatch = async (sellerId, needTitle) => {
  const token = await getToken(sellerId);
  console.log(`[notify] Seller ${sellerId}: new need matched — "${needTitle}"`);
  await sendPushNotification(
    token,
    'Someone needs what you have!',
    `A student posted: ${needTitle}`,
    { type: 'match', screen: 'MyListings' }
  );
};

const notifyBuyerEscrowConfirmed = async (buyerId, amountPaise) => {
  const token = await getToken(buyerId);
  const amount = (amountPaise / 100).toLocaleString('en-IN');
  console.log(`[notify] Buyer ${buyerId}: payment escrowed — Rs ${amount}`);
  await sendPushNotification(
    token,
    'Payment confirmed',
    `Your payment of Rs ${amount} is held safely in escrow`,
    { type: 'escrow', screen: 'MyTransactions' }
  );
};

const notifySellerEscrowReleased = async (sellerId, amountPaise) => {
  const token = await getToken(sellerId);
  const amount = (amountPaise / 100).toLocaleString('en-IN');
  console.log(`[notify] Seller ${sellerId}: escrow released — Rs ${amount}`);
  await sendPushNotification(
    token,
    'Money released!',
    `Rs ${amount} has been transferred to your account`,
    { type: 'release', screen: 'MyTransactions' }
  );
};

const notifyDisputeRaised = async (sellerId, buyerId, transactionId) => {
  const [sellerToken, buyerToken] = await Promise.all([getToken(sellerId), getToken(buyerId)]);
  console.log(`[notify] Dispute on txn ${transactionId} — seller: ${sellerId}, buyer: ${buyerId}`);
  await Promise.all([
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
  notifyNewMessage,
  notifySellerOfMatch,
  notifyBuyerEscrowConfirmed,
  notifySellerEscrowReleased,
  notifyDisputeRaised,
  notifyAdminListingFlagged,
};
