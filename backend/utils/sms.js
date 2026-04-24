/**
 * sms.js
 * Sends SMS OTPs via Fast2SMS (free tier, India).
 * Falls back to console.log if API key is not configured.
 *
 * Sign up at https://www.fast2sms.com to get a free API key.
 */

const sendSmsOtp = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  // Strip country code for Fast2SMS (expects 10-digit Indian number)
  const digits = phone.replace(/\D/g, '');
  const number = digits.length === 12 && digits.startsWith('91')
    ? digits.slice(2)   // +91XXXXXXXXXX → XXXXXXXXXX
    : digits.length === 10
      ? digits
      : null;

  if (!apiKey || apiKey.startsWith('your_')) {
    console.log(`[MOCK SMS] OTP for ${phone}: ${otp}`);
    return;
  }

  if (!number) {
    console.warn(`[SMS] Cannot parse phone number: ${phone}`);
    return;
  }

  const url = new URL('https://www.fast2sms.com/dev/bulkV2');
  url.searchParams.set('authorization', apiKey);
  url.searchParams.set('route', 'otp');
  url.searchParams.set('variables_values', otp);
  url.searchParams.set('flash', '0');
  url.searchParams.set('numbers', number);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!data.return) {
    console.error('[SMS] Fast2SMS error:', JSON.stringify(data));
    throw new Error('Failed to send OTP SMS. Please try again.');
  }

  console.log(`[SMS] OTP sent to ${phone} via Fast2SMS`);
};

module.exports = { sendSmsOtp };
