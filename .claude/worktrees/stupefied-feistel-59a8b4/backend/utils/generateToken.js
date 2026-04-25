const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateJWT = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// 6-digit numeric OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Cryptographically random hex token for email verification links
const generateEmailToken = () => crypto.randomBytes(32).toString('hex');

module.exports = { generateJWT, generateOTP, generateEmailToken };
