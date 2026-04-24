const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const { uploadBuffer } = require('../utils/cloudinary');
const User = require('../models/User');

const router = express.Router();

// In-memory upload sessions: token → { userId, url, createdAt }
const uploadSessions = new Map();
const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

function pruneExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of uploadSessions) {
    if (now - session.createdAt > SESSION_TTL_MS) uploadSessions.delete(token);
  }
}
setInterval(pruneExpiredSessions, 60_000);

const ALLOWED_MIMETYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, jpeg, png, and webp files are accepted'));
    }
  },
});

// Wraps multer so we control the error shape instead of letting it bubble
const runUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 5MB limit' : err.message;
    res.status(400).json({ success: false, message });
  });
};

const requireFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  next();
};

// POST /api/upload/image
router.post('/image', protect, runUpload('image'), requireFile, async (req, res, next) => {
  try {
    const result = await uploadBuffer(req.file.buffer, `peercart/${req.user._id}`);
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    next(err);
  }
});

// POST /api/upload/session — desktop creates a short-lived token for mobile upload
router.post('/session', protect, (req, res) => {
  pruneExpiredSessions();
  const token = crypto.randomBytes(16).toString('hex');
  uploadSessions.set(token, { userId: req.user._id.toString(), url: null, createdAt: Date.now() });
  res.json({ success: true, token });
});

// GET /api/upload/session/:token — desktop polls for completion
router.get('/session/:token', protect, (req, res) => {
  const session = uploadSessions.get(req.params.token);
  if (!session) return res.status(404).json({ success: false, message: 'Session not found or expired' });
  if (session.userId !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' });
  res.json({ success: true, completed: !!session.url, url: session.url || null });
});

// POST /api/upload/mobile/:token — phone uploads image (no auth needed, token is the credential)
router.post('/mobile/:token', runUpload('image'), requireFile, async (req, res, next) => {
  try {
    const session = uploadSessions.get(req.params.token);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found or expired' });
    const result = await uploadBuffer(req.file.buffer, `peercart/${session.userId}`);
    session.url = result.secure_url;
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    next(err);
  }
});

// POST /api/upload/student-id
router.post('/student-id', protect, runUpload('image'), requireFile, async (req, res, next) => {
  try {
    const result = await uploadBuffer(
      req.file.buffer,
      `peercart/student-ids/${req.user._id}`
    );

    await User.findByIdAndUpdate(req.user._id, { studentIdPhoto: result.secure_url });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
