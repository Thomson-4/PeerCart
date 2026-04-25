const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS for SRV lookups (bypasses router DNS issues)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // ── One-time index migration ────────────────────────────────────────────────
    // Replace the old sparse unique indexes on phone/email (which index null and
    // cause E11000 conflicts for email-only users) with partial indexes that only
    // index actual string values. Runs silently — safe to run on every startup.
    try {
      const db = conn.connection.db;
      const usersCol = db.collection('users');

      // Drop old sparse indexes if they exist (ignore error if already gone)
      await usersCol.dropIndex('phone_1').catch(() => {});
      await usersCol.dropIndex('email_1').catch(() => {});

      // Clean up any existing phone:null or email:null values
      await usersCol.updateMany(
        { $or: [{ phone: null }, { phone: '' }] },
        { $unset: { phone: '' } }
      );
      await usersCol.updateMany(
        { $or: [{ email: null }, { email: '' }] },
        { $unset: { email: '' } }
      );

      console.log('[db] Index migration complete — partial indexes will be ensured by Mongoose');
    } catch (migErr) {
      // Non-fatal — log and continue
      console.warn('[db] Index migration warning:', migErr.message);
    }
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
