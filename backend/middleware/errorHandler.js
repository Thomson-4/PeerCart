// Centralised error handling middleware — must be registered last in server.js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key (e.g. duplicate phone/email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field];
    // A null/undefined duplicate on phone means stale data — surface a helpful message
    if (field === 'phone' && (value == null || value === '')) {
      message = 'Account setup conflict — please try signing in instead, or contact support.';
    } else if (field === 'email') {
      message = 'This email is already registered. Please sign in instead.';
    } else {
      message = `${field} is already registered`;
    }
    statusCode = 409;
  }

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
