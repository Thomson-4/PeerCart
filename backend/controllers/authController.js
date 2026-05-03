const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Campus = require('../models/Campus');
const { generateJWT, generateOTP, generateEmailToken } = require('../utils/generateToken');
const { sendOtpEmail } = require('../utils/mailer');
const { sendSmsOtp }   = require('../utils/sms');

const OTP_EXPIRY_MS = 10 * 60 * 1000;          // 10 minutes
const EMAIL_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// POST /api/auth/send-otp
const sendOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phone } = req.body;

    // DEV BYPASS: skip real OTP, just upsert user and tell client to use 000000
    if (process.env.DEV_BYPASS === 'true') {
      await User.findOneAndUpdate(
        { phone },
        {},
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[DEV] OTP bypass active — use 000000 for ${phone}`);
      return res.json({ success: true, message: 'OTP sent (dev: use 000000)' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    await User.findOneAndUpdate(
      { phone },
      { otp, otpExpiry },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendSmsOtp(phone, otp);
    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phone, otp, referralCode } = req.body;

    // DEV BYPASS: accept 000000 for any phone without real OTP check
    if (process.env.DEV_BYPASS === 'true' && otp === '000000') {
      let user = await User.findOne({ phone });
      if (!user) {
        user = await User.create({ phone });
      }

      if (!user.campus) {
        const campus = await Campus.findOne({ active: true });
        if (campus) user.campus = campus._id;
      }
      user.trustLevel = Math.max(user.trustLevel, 2);
      await user.save();

      return res.json({
        success: true,
        token: generateJWT(user._id),
        user: { id: user._id, phone: user.phone, name: user.name, trustLevel: user.trustLevel, campus: user.campus },
      });
    }

    const user = await User.findOne({ phone }).select('+otp +otpExpiry');

    if (!user?.otp) {
      return res
        .status(400)
        .json({ success: false, message: 'No OTP requested for this number' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Consume OTP
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Auto-assign the first active campus if none set
    if (!user.campus) {
      const campus = await Campus.findOne({ active: true }).sort({ createdAt: 1 });
      if (campus) user.campus = campus._id;
    }

    // Round 9 — Process referral code on first sign-in
    if (referralCode && !user.referredBy) {
      try {
        const Ambassador = require('../models/Ambassador');
        const ambassador = await Ambassador.findOne({ referralCode: referralCode.toUpperCase(), active: true });
        if (ambassador && ambassador.user.toString() !== user._id.toString()) {
          user.referredBy   = ambassador.user;
          user.referralCode = referralCode.toUpperCase();
          ambassador.referredUsers.push(user._id);
          await ambassador.save();
        }
      } catch (refErr) {
        // Non-fatal — referral errors never block login
        console.error('[referral] Error processing referral code:', refErr.message);
      }
    }

    await user.save();

    res.json({
      success: true,
      token: generateJWT(user._id),
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        trustLevel: user.trustLevel,
        campus: user.campus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-email  (protected — requires JWT)
const verifyEmail = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    // Enforce campus email domain when the user has a campus assigned
    if (req.user.campus) {
      const campus = await Campus.findById(req.user.campus);
      if (campus) {
        const domain = email.split('@')[1]?.toLowerCase();
        if (domain !== campus.emailDomain) {
          return res.status(400).json({
            success: false,
            message: `Email must use your campus domain: @${campus.emailDomain}`,
          });
        }
      }
    }

    const taken = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (taken) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const token = generateEmailToken();

    await User.findByIdAndUpdate(req.user._id, {
      email,
      emailVerificationToken: token,
      emailVerificationExpiry: new Date(Date.now() + EMAIL_TOKEN_EXPIRY_MS),
    });

    // Link opens the FRONTEND confirm-email page, which then calls the API
    const verifyUrl = `${process.env.CLIENT_URL}/confirm-email/${token}`;

    // Mock mailer — replace with Nodemailer / SendGrid in production
    console.log(`[MOCK EMAIL] Verification link for ${email}:\n  ${verifyUrl}`);

    res.json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/confirm-email/:token  (public — clicked from email link)
const confirmEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpiry: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpiry');

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Verification link is invalid or has expired' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    if (user.trustLevel < 1) user.trustLevel = 1;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified. Trust Level upgraded to 1.',
      trustLevel: user.trustLevel,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/send-email-otp
// Signs up OR signs in via college email. Validates domain against a known campus.
// Body: { email, mode: 'login' | 'signup', name? }
//   mode='login'  → fails if no account exists ("No account found, please sign up")
//   mode='signup' → fails if a verified account already exists ("Already registered, please sign in")
const sendEmailOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, mode = 'login', name } = req.body;
    const domain = email.split('@')[1]?.toLowerCase();

    // DEV BYPASS: skip real OTP, upsert user and tell client to use 000000
    if (process.env.DEV_BYPASS === 'true') {
      const campus = await Campus.findOne({ active: true });
      let user = await User.findOne({ email });
      if (mode === 'login' && !user) {
        return res.status(404).json({ success: false, message: 'No account found for this email. Please sign up first.' });
      }
      if (mode === 'signup' && user?.emailVerified) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists. Please sign in instead.' });
      }
      if (user) {
        user.otp = '000000';
        user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
        if (campus) user.campus = campus._id;
        if (mode === 'signup' && name?.trim()) user.name = name.trim();
        await user.save();
      } else {
        const newDoc = { email, otp: '000000', otpExpiry: new Date(Date.now() + OTP_EXPIRY_MS), campus: campus?._id };
        if (name?.trim()) newDoc.name = name.trim();
        await User.create(newDoc);
      }
      console.log(`[DEV] Email OTP bypass — use 000000 for ${email}`);
      return res.json({ success: true, message: 'OTP sent (dev: use 000000)' });
    }

    // Must be a known campus domain
    const campus = await Campus.findOne({ emailDomain: domain, active: true });
    if (!campus) {
      return res.status(400).json({
        success: false,
        message: `"@${domain}" is not a recognised campus domain. Use your college email.`,
      });
    }

    const existingUser = await User.findOne({ email });

    // Login mode: account must already exist
    if (mode === 'login' && !existingUser) {
      return res.status(404).json({
        success: false,
        message: 'No account found for this email. Please sign up first.',
      });
    }

    // Signup mode: a verified account must NOT already exist
    if (mode === 'signup' && existingUser?.emailVerified) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    // Use find-then-save (never upsert) to avoid writing phone:null into new docs.
    if (existingUser) {
      existingUser.otp       = otp;
      existingUser.otpExpiry = otpExpiry;
      existingUser.campus    = campus._id;
      if (mode === 'signup' && name?.trim()) existingUser.name = name.trim();
      await existingUser.save();
    } else {
      const newDoc = { email, otp, otpExpiry, campus: campus._id };
      if (name?.trim()) newDoc.name = name.trim();
      await User.create(newDoc);
    }

    // Send real OTP email via Gmail
    await sendOtpEmail(email, otp, mode === 'login' ? 'login' : 'verification');

    res.json({ success: true, message: 'OTP sent to your college email' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-email-otp
// Verifies the OTP sent to the college email.
// Since the domain was already validated at send time, the user is immediately Level 1.
const verifyEmailOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, otp } = req.body;

    // DEV BYPASS: accept 000000 without real OTP check
    if (process.env.DEV_BYPASS === 'true' && otp === '000000') {
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
      user.emailVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      if (user.trustLevel < 1) user.trustLevel = 1;
      await user.save();
      return res.json({
        success: true,
        token: generateJWT(user._id),
        user: { id: user._id, email: user.email, phone: user.phone, name: user.name, trustLevel: user.trustLevel, campus: user.campus },
      });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user?.otp) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Consume OTP + mark email verified + grant Level 1 (domain was validated at send time)
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.emailVerified = true;
    if (user.trustLevel < 1) user.trustLevel = 1;
    await user.save();

    console.log(`[AUTH] Email login: ${email} → Level ${user.trustLevel}`);

    res.json({
      success: true,
      token: generateJWT(user._id),
      user: {
        id:         user._id,
        email:      user.email,
        phone:      user.phone,
        name:       user.name,
        trustLevel: user.trustLevel,
        campus:     user.campus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/signup  — password-based registration
const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    // Check for duplicates
    const emailTaken = email && await User.findOne({ email });
    if (emailTaken) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const phoneTaken = phone && await User.findOne({ phone });
    if (phoneTaken) {
      return res.status(409).json({ success: false, message: 'Phone number already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto-assign first active campus
    const campus = await Campus.findOne({ active: true }).sort({ createdAt: 1 });

    const user = await User.create({
      name,
      email:    email || undefined,
      phone:    phone || undefined,
      password: hashedPassword,
      campus:   campus?._id || undefined,
      // Email-registered users start at Level 0;
      // they can verify college email later to reach Level 1
      trustLevel: 0,
    });

    console.log(`[AUTH] New signup: ${name} <${email || phone}>`);

    res.status(201).json({
      success: true,
      token: generateJWT(user._id),
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        phone:      user.phone,
        trustLevel: user.trustLevel,
        campus:     user.campus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/signin  — password-based login (email or phone)
const signin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { identifier, password } = req.body; // identifier = email OR phone

    // Find by email or phone (include password field)
    const isEmail = identifier.includes('@');
    const user = await User.findOne(
      isEmail ? { email: identifier.toLowerCase().trim() } : { phone: identifier.trim() }
    ).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log(`[AUTH] Signin: ${identifier}`);

    res.json({
      success: true,
      token: generateJWT(user._id),
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        phone:      user.phone,
        trustLevel: user.trustLevel,
        campus:     user.campus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/profile  (protected — requires JWT)
// Accepts: { name?, avatar? }  — both optional, at least one must be present
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (trimmed.length < 2 || trimmed.length > 60) {
        return res.status(400).json({ success: false, message: 'Name must be 2–60 characters' });
      }
      updates.name = trimmed;
    }

    if (avatar !== undefined) {
      // Accept a Cloudinary URL or any HTTPS URL
      if (typeof avatar !== 'string' || !avatar.startsWith('http')) {
        return res.status(400).json({ success: false, message: 'Invalid avatar URL' });
      }
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

    res.json({
      success: true,
      user: {
        id:                    user._id,
        phone:                 user.phone,
        name:                  user.name,
        email:                 user.email,
        emailVerified:         user.emailVerified,
        avatar:                user.avatar,
        trustLevel:            user.trustLevel,
        completedTransactions: user.completedTransactions,
        averageRating:         user.averageRating,
        campus:                user.campus,
        createdAt:             user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendOtp, verifyOtp, verifyEmail, confirmEmail, sendEmailOtp, verifyEmailOtp, signup, signin, updateProfile };
