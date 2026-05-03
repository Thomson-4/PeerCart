// Usage: router.post('/...', protect, requireTrust(1), handler)
const requireTrust = (minLevel) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.trustLevel < minLevel) {
    return res.status(403).json({
      success: false,
      message: `Trust Level ${minLevel} required. Your current level is ${req.user.trustLevel}.`,
      currentTrustLevel: req.user.trustLevel,
      requiredTrustLevel: minLevel,
    });
  }

  next();
};

module.exports = { requireTrust };
