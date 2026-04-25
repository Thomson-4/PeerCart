/**
 * Round 8D — Auto-expire listings after 30 days.
 * TODO: Replace setInterval with a Bull queue job in production.
 */

const Listing = require('../models/Listing');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const INTERVAL_MS    = 24 * 60 * 60 * 1000; // run daily

/**
 * Finds all active listings last updated more than 30 days ago
 * and sets their status to 'expired'.
 */
const expireOldListings = async () => {
  try {
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);
    const result = await Listing.updateMany(
      { status: 'active', updatedAt: { $lt: cutoff } },
      { $set: { status: 'expired' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[expiry] Expired ${result.modifiedCount} stale listing(s)`);
    }
  } catch (err) {
    console.error('[expiry] Error running expireOldListings:', err.message);
  }
};

/**
 * Starts the 24-hour expiry job.
 * Call this once from server.js on startup.
 */
const startExpiryJob = () => {
  // Run once immediately on startup, then every 24 hours
  expireOldListings();
  // TODO: Replace with Bull queue job in production
  setInterval(expireOldListings, INTERVAL_MS);
  console.log('[expiry] Listing expiry job started (24h interval)');
};

module.exports = { expireOldListings, startExpiryJob };
