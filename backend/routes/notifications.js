const express = require('express');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.use(protect);

// PUT /api/notifications/fcm-token
// Called by the frontend every time the app opens with a fresh FCM token.
router.put(
  '/fcm-token',
  [body('fcmToken').notEmpty().withMessage('fcmToken is required')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      await User.findByIdAndUpdate(req.user._id, { fcmToken: req.body.fcmToken });
      res.json({ success: true, message: 'FCM token updated' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
