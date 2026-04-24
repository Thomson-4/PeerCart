require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// ── Routes ───────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const listingRoutes      = require('./routes/listings');
const needRoutes         = require('./routes/needs');
const transactionRoutes  = require('./routes/transactions');
const reviewRoutes       = require('./routes/reviews');
const uploadRoutes       = require('./routes/upload');
const adminRoutes        = require('./routes/admin');
const chatRoutes         = require('./routes/chat');          // Round 5
const notificationRoutes = require('./routes/notifications'); // Round 6
const reportRoutes       = require('./routes/reports');       // Round 8C
const ambassadorRoutes   = require('./routes/ambassador');    // Round 9

// ── Startup jobs ─────────────────────────────────────────────────
const { startExpiryJob } = require('./utils/listingExpiry'); // Round 8D

const app = express();

connectDB();

// Security & logging
app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*')) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(requestLogger);
// Capture raw body for Razorpay webhook signature verification
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

// ── Health check (Railway / uptime monitors) ─────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', env: process.env.NODE_ENV });
});

// ── API routes ───────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/listings',      listingRoutes);
app.use('/api/needs',         needRoutes);
app.use('/api/transactions',  transactionRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/chat',          chatRoutes);           // Round 5
app.use('/api/notifications', notificationRoutes);   // Round 6
app.use('/api/reports',       reportRoutes);         // Round 8C
app.use('/api/ambassador',    ambassadorRoutes);     // Round 9

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralised error handler — must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`PeerCart server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);

  // Round 8D — Start listing expiry background job (runs every 24h)
  startExpiryJob();
});
