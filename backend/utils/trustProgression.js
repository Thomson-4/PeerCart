const User = require('../models/User');

const LEVELS = [
  // Check higher levels first so a single call can jump from 1 → 3 if criteria met
  { level: 3, minTransactions: 10, minRating: 4.3 },
  { level: 2, minTransactions: 3,  minRating: 4.0 },
];

const checkTrustProgression = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  for (const { level, minTransactions, minRating } of LEVELS) {
    if (
      user.trustLevel < level &&
      user.completedTransactions >= minTransactions &&
      user.averageRating >= minRating
    ) {
      user.trustLevel = level;
      await user.save();
      console.log(`[trust] User ${userId} upgraded to trust level ${level}`);
      return; // one upgrade per call — re-check on next completion if needed
    }
  }
};

module.exports = { checkTrustProgression };
