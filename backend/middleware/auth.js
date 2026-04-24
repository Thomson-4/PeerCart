const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  // DEV BYPASS: attach the first user in DB so you can test without logging in
  if (process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS === 'true') {
    const Campus = require('../models/Campus');
    let user = await User.findOne({});
    if (!user) {
      const campus = await Campus.findOne({ active: true });
      user = await User.create({
        phone: '+919999999999',
        name: 'Dev User',
        campus: campus?._id,
        trustLevel: 2,
      });
    }
    req.user = user;
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
