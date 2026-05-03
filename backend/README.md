# PeerCart Campus — Backend API

Trust-first peer-to-peer marketplace for college students. Campus-closed: users only see listings from their own verified institution.

---

## Setup

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Install

```bash
cd backend
npm install
cp .env.example .env   # fill in required values
npm run dev            # starts with nodemon on PORT (default 5000)
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | HTTP port (default 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Long random string for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `7d`) |
| `CLIENT_URL` | Yes | Frontend URL for CORS (e.g. `http://localhost:3000`) |
| `EMAIL_VERIFY_BASE_URL` | Yes | Base URL for email verification links |
| `EMAIL_FROM` | No | Sender address for transactional email |
| `EMAIL_HOST` | No | SMTP host |
| `EMAIL_PORT` | No | SMTP port |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP password |
| `TWILIO_ACCOUNT_SID` | No | Twilio SID (OTPs are console-logged in dev) |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token |
| `TWILIO_PHONE` | No | Twilio sender number |
| `ADMIN_SECRET` | Yes | Shared secret for `X-Admin-Secret` header |
| `RAZORPAY_KEY_ID` | No | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | No | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | No | For HMAC webhook signature verification |
| `CLOUDINARY_CLOUD_NAME` | Yes (uploads) | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes (uploads) | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes (uploads) | Cloudinary API secret |

---

## Trust Levels

| Level | Requirements | Capabilities |
|---|---|---|
| 0 | Phone verified | Browse only |
| 1 | College email verified + student ID uploaded | Transact up to Rs 1,500 |
| 2 | Level 1 + 3 completed transactions rated ≥ 4.0★ | Full access, list items for rent |
| 3 | Level 2 + 10 completed transactions rated ≥ 4.3★ | Power user — priority matching, badge |

---

## API Endpoints

All money values are in **paise** (integers). `Authorization: Bearer <token>` required unless marked public.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/send-otp` | Public | Send 6-digit OTP to phone. Rate-limited: 5 req / 15 min per phone |
| POST | `/api/auth/verify-otp` | Public | Verify OTP, receive JWT |
| POST | `/api/auth/verify-email` | JWT | Send college email verification link |
| GET | `/api/auth/confirm-email/:token` | Public | Confirm email, upgrade to Trust Level 1 |

### Listings

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/listings` | JWT + Level 1 | Create listing. Level 2 required for `type: rent` |
| GET | `/api/listings` | JWT | Campus-scoped listings. Query: `category`, `type`, `condition`, `minPrice`, `maxPrice`, `page`, `limit` |
| GET | `/api/listings/:id` | JWT | Single listing (increments view count) |
| PUT | `/api/listings/:id` | JWT (owner) | Update listing (seller, campus, type immutable) |
| DELETE | `/api/listings/:id` | JWT (owner) | Delete listing |

### Needs

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/needs` | JWT + Level 1 | Post a need. Auto-expires in 7 days. Triggers smart match |
| GET | `/api/needs` | JWT | Open campus needs. Query: `category`, `type`, `page`, `limit` |
| DELETE | `/api/needs/:id` | JWT (owner) | Close own need (soft delete → expired) |

### Transactions

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/transactions/initiate` | JWT + Level 1 | Create transaction + Razorpay order. Body: `listingId`, `type`, `rentalStartDate?`, `rentalEndDate?` |
| POST | `/api/transactions/webhook` | Public (signed) | Razorpay webhook — verifies `X-Razorpay-Signature` |
| POST | `/api/transactions/:id/confirm-receipt` | JWT (buyer) | Buyer confirms receipt → escrow released, trust progression checked |
| POST | `/api/transactions/:id/raise-dispute` | JWT (party) | Raise dispute within 24 hr of escrow. Body: `reason` |
| GET | `/api/transactions/my` | JWT | Paginated transaction history (buyer + seller) |

### Reviews

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/reviews` | JWT | Review for a completed transaction. Body: `transactionId`, `rating` (1–5), `comment?`. One per reviewer per transaction |

### Uploads

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/upload/image` | JWT | Upload listing image → Cloudinary `peercart/{userId}/`. Returns `url` |
| POST | `/api/upload/student-id` | JWT | Upload student ID → `peercart/student-ids/{userId}/`. Saves URL to user profile |

Accepted: `jpg`, `jpeg`, `png`, `webp`. Max size: 5 MB. Form field name: `image`.

### Admin

All admin routes require `X-Admin-Secret: <ADMIN_SECRET>` header.

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users` | List users. Query: `trustLevel`, `campus`, `page`, `limit` |
| GET | `/api/admin/transactions` | List transactions. Query: `status`, `page`, `limit` |
| GET | `/api/admin/disputes` | Disputed transactions only, sorted by `disputeRaisedAt` |
| PUT | `/api/admin/users/:id/trust` | Manually set trust level. Body: `{ trustLevel: 0\|1\|2\|3 }` |
| GET | `/api/admin/stats` | `{ totalUsers, totalListings, totalTransactions, totalGMVPaise, disputeRate, campusBreakdown }` |

---

## Item Categories

`textbooks` · `electronics` · `formal-wear` · `cycles` · `hobby-gear` · `hostel-essentials`

## Transaction States

`initiated` → `escrowed` → `completed`  
`escrowed` → `disputed` (within 24 hr)  
`initiated` → `cancelled`

Escrow auto-releases after 48 hours if buyer does not confirm receipt.  
> **Note:** The 48-hr auto-release uses `setTimeout` and does not survive server restarts. Replace with [Bull/BullMQ](https://docs.bullmq.io/) in production.

---

## Project Structure

```
backend/
├── server.js                  Entry point
├── config/db.js               Mongoose connection
├── middleware/
│   ├── auth.js                JWT verify → req.user
│   ├── trust.js               requireTrust(n)
│   ├── adminAuth.js           X-Admin-Secret header check
│   ├── errorHandler.js        Centralised error handler
│   └── requestLogger.js       Structured request logger (method/path/status/ms/userId)
├── models/
│   ├── User.js
│   ├── Campus.js
│   ├── Listing.js
│   ├── Need.js
│   ├── Transaction.js
│   └── Review.js
├── controllers/
│   ├── authController.js
│   ├── listingController.js
│   ├── needController.js
│   ├── transactionController.js
│   ├── reviewController.js
│   └── adminController.js
├── routes/
│   ├── auth.js
│   ├── listings.js
│   ├── needs.js
│   ├── transactions.js
│   ├── reviews.js
│   ├── upload.js
│   └── admin.js
└── utils/
    ├── generateToken.js       JWT + OTP + email token generators
    ├── cloudinary.js          Buffer → Cloudinary upload
    ├── matcher.js             Smart need-to-listing matching
    ├── notifications.js       Notification stubs (→ FCM/SMS in production)
    └── trustProgression.js    Trust level upgrade logic
```
