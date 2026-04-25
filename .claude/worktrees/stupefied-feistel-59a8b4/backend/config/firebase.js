/**
 * Firebase Admin SDK — Round 6 (Push Notifications)
 *
 * Initialised from FIREBASE_SERVICE_ACCOUNT_JSON env var (JSON string).
 * If the env var is missing the module still loads — FCM calls are silently
 * skipped so the server never crashes in environments without Firebase.
 */

let firebaseApp = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const admin = require('firebase-admin');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('[firebase] Admin SDK initialised');
  } else {
    console.warn('[firebase] FIREBASE_SERVICE_ACCOUNT_JSON not set — push notifications disabled');
  }
} catch (err) {
  console.error('[firebase] Failed to initialise Admin SDK:', err.message);
}

/**
 * Send a push notification via FCM.
 *
 * @param {string|null} fcmToken  Recipient's device token
 * @param {string}      title     Notification title
 * @param {string}      body      Notification body
 * @param {Object}      data      Extra key-value payload (all values must be strings)
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) return; // device token not registered — skip silently

  if (!firebaseApp) {
    console.log(`[FCM-mock] → ${title}: ${body}`);
    return;
  }

  try {
    const admin = require('firebase-admin');
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
    });
  } catch (err) {
    // Never crash — FCM errors are non-fatal
    console.error(`[FCM] Failed to send to ${fcmToken}:`, err.message);
  }
};

module.exports = { sendPushNotification };
