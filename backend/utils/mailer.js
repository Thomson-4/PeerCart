/**
 * mailer.js
 * Sends transactional emails via Resend (preferred) or Gmail SMTP fallback.
 */
const nodemailer = require('nodemailer');

// ── Resend (recommended for production) ───────────────────────────────────────
const sendViaResend = async (to, subject, html) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'PeerCart <noreply@peer-cart-brown.vercel.app>',
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Resend error: ${err.message || res.status}`);
  }
  console.log(`[EMAIL] OTP sent to ${to} via Resend`);
};

// ── Gmail SMTP fallback ────────────────────────────────────────────────────────
let _transporter = null;
const getTransporter = () => {
  if (_transporter) return _transporter;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass || user.startsWith('your_')) return null;
  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  return _transporter;
};

const sendViaGmail = async (to, subject, html) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[MOCK EMAIL] No mailer configured — OTP for ${to} logged to console only`);
    return;
  }
  await transporter.sendMail({
    from: `"PeerCart Campus" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  console.log(`[EMAIL] OTP sent to ${to} via Gmail`);
};

// ── OTP email builder ──────────────────────────────────────────────────────────
const sendOtpEmail = async (to, otp, purpose = 'verification') => {
  const subject = purpose === 'login'
    ? `Your PeerCart login OTP: ${otp}`
    : `Verify your PeerCart email: ${otp}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #0f0f0f; color: #f0f0f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.5px;">PeerCart</h1>
        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Campus Marketplace</p>
      </div>
      <div style="padding: 40px;">
        <p style="margin: 0 0 8px; color: #a0a0a0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
          Your one-time password
        </p>
        <div style="background: #1a1a2e; border: 2px solid #7c3aed; border-radius: 12px; padding: 24px; text-align: center; margin: 16px 0 28px;">
          <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #a78bfa; font-family: 'Courier New', monospace;">
            ${otp}
          </span>
        </div>
        <p style="margin: 0 0 8px; color: #d0d0d0; font-size: 15px; line-height: 1.6;">
          Enter this OTP on PeerCart to ${purpose === 'login' ? 'sign in to' : 'verify'} your campus account.
        </p>
        <p style="margin: 0 0 28px; color: #888; font-size: 13px;">
          ⏱ This OTP expires in <strong style="color: #f0f0f0;">10 minutes</strong>. Do not share it with anyone.
        </p>
        <div style="border-top: 1px solid #2a2a2a; padding-top: 20px;">
          <p style="margin: 0; color: #666; font-size: 12px; line-height: 1.6;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
      <div style="background: #0a0a0a; padding: 20px 40px; text-align: center;">
        <p style="margin: 0; color: #444; font-size: 12px;">PeerCart · REVA University Campus Marketplace</p>
      </div>
    </div>
  `;

  // Use Resend if configured, otherwise fall back to Gmail
  if (process.env.RESEND_API_KEY) {
    await sendViaResend(to, subject, html);
  } else {
    await sendViaGmail(to, subject, html);
  }
};

module.exports = { sendOtpEmail };
