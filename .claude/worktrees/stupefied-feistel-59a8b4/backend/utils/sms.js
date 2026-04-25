/**
 * sms.js
 * Sends SMS OTPs via Fast2SMS (free tier, India).
 * Falls back to console.log if:
 *   - FAST2SMS_API_KEY is not set / is a placeholder, OR
 *   - Fast2SMS rejects the request (e.g. insufficient balance).
 *
 * Phone OTP is intentionally kept as a backend console.log mock until
 * a paid SMS plan is available.  Railway logs will show the OTP during demos.
 *
 * Sign up at https://www.fast2sms.com to get a free API key.
 */

const sendSmsOtp = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  // No key configured — fall straight through to mock
  if (!apiKey || apiKey.startsWith('your_')) {
    console.log(`[MOCK SMS] OTP for ${phone}: ${otp}`);
    return;
  }

  // Strip country code for Fast2SMS (expects 10-digit Indian number)
  const digits = phone.replace(/\D/g, '');
  const number = digits.length === 12 && digits.startsWith('91')
    ? digits.slice(2)   // +91XXXXXXXXXX → XXXXXXXXXX
    : digits.length === 10
      ? digits
      : null;

  if (!number) {
    console.warn(`[SMS] Cannot parse phone number: ${phone} — falling back to mock`);
    console.log(`[MOCK SMS] OTP for ${phone}: ${otp}`);
    return;
  }

  try {
    const url = new URL('https://www.fast2sms.com/dev/bulkV2');
    url.searchParams.set('authorization', apiKey);
    url.searchParams.set('route', 'q');
    url.searchParams.set('message', `Your PeerCart OTP is ${otp}. Valid for 10 minutes. Do not share.`);
    url.searchParams.set('flash', '0');
    url.searchParams.set('numbers', number);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!data.return) {
      console.warn('[SMS] Fast2SMS rejected request:', JSON.stringify(data), '— falling back to mock');
      console.log(`[MOCK SMS] OTP for ${phone}: ${otp}`);
      return;
    }

    console.log(`[SMS] OTP sent to ${phone} via Fast2SMS`);
  } catch (err) {
    // Network error or unexpected response — never crash the auth flow
    console.warn('[SMS] Fast2SMS unreachable:', err.message, '— falling back to mock');
    console.log(`[MOCK SMS] OTP for ${phone}: ${otp}`);
  }
};

module.exports = { sendSmsOtp };
