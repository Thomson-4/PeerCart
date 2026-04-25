# PeerCart — Campus Marketplace

<img width="160" alt="PeerCart Logo" src="https://github.com/user-attachments/assets/4f89e660-0b56-44f5-b38e-a98a6114a98d" />

> **Buy · Sell · Rent** — A hyper-local, AI-powered peer-to-peer marketplace built exclusively for college students.

---

## What is PeerCart?

PeerCart is a **verified campus marketplace** where students can buy, sell, and rent items — textbooks, electronics, cycles, hostel essentials — within their own college community. Every user is verified through their college email, so trust is built in from day one.

No more WhatsApp groups. No more OLX strangers. Just your campus.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | *(Vercel URL — coming soon)* |
| Backend API | *(Railway URL — coming soon)* |
| Health Check | `GET /api/health` |

---

## Features

### Core Marketplace
- **Listings** — Post items for sale or rent with photos, price, category, and condition
- **Need Board** — Post what you're looking for; sellers come to you
- **6 Categories** — Textbooks, Electronics, Formal Wear, Cycles, Hobby Gear, Hostel Essentials
- **Listing Expiry** — Auto-expires after 30 days; renew up to 3 times

### Trust System (0–3 Levels)
| Level | How to get it | What unlocks |
|---|---|---|
| 0 | Sign up | Browse listings |
| 1 | Verify college email | Create listings, initiate transactions |
| 2 | Admin approval | Live photo capture, higher daily limits |
| 3 | Admin | Full access |

### Payments & Escrow
- **Razorpay integration** — Real payment processing (test mode for demo)
- **Escrow flow** — Funds held until buyer confirms receipt
- **Dispute system** — Either party can raise a dispute; admin resolves it
- **Daily limits** — Level 1: 3 txns/day, Level 2: 10 txns/day

### Authentication (3 methods)
- **Phone OTP** — Login via SMS OTP → Trust Level 0
- **College Email OTP** — Login via `@reva.edu.in` OTP → Trust Level 1 instantly
- **Password** — Traditional signup with name, email, phone, password

### AI Features
- **AI Price Suggestion** — Claude AI suggests price range when creating a listing based on category, condition, and description

### In-App Chat
- Direct messaging between buyer and seller on any listing
- Unread message count badges
- Messages auto-marked read on open

### Anti-Scam Layer
- **Live Capture** — Mobile camera opens rear camera for listing photos; verified badge shown to buyers
- **Cloudinary Watermarking** — Photos stamped with `PeerCart · DD/MM/YYYY HH:MM`
- **Report System** — Any user can report a listing; 3+ reports auto-flags for admin review

### Ambassador Program
- Trust Level 2+ users can become Campus Ambassadors
- Unique 8-character referral code
- **2% commission** on every completed transaction by referred users
- Admin dashboard to view GMV and pay out commissions

### Push Notifications (FCM)
- New message alerts
- Transaction status updates (escrowed, completed, disputed)
- New listing matches for posted Needs

### Admin Panel
- Manage users, listings, transactions, disputes, reports
- Set trust levels manually
- **Demand Heatmap** — needs vs listings by category, campus stats, weekly GMV
- **Campus Deep-Dive** — top sellers, dispute rate, avg rating, conversion rate

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · React Router v7 · Tailwind CSS v4 |
| Backend | Node.js · Express |
| Database | MongoDB Atlas · Mongoose |
| Auth | JWT · bcryptjs · OTP (Twilio mock) |
| Payments | Razorpay |
| AI | Anthropic Claude (`claude-sonnet-4-5`) |
| Push Notifications | Firebase FCM |
| Image Storage | Cloudinary (upload + timestamp watermark) |
| Deployment | Railway (backend) · Vercel (frontend) |

---

## Project Structure

```
PeerCart/
├── backend/
│   ├── config/          # DB + Firebase config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, trust, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── scripts/         # wipeData, seedCampus, demoCheck
│   ├── utils/           # Notifications, price AI, Cloudinary, expiry job
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── context/     # AuthContext
│   │   ├── layouts/     # MainLayout
│   │   ├── pages/       # Landing, Login, Signup, Feed, AddItem, Profile…
│   │   ├── components/  # Header, ItemCard
│   │   └── services/    # api.js (all fetch calls)
│   └── vercel.json
├── railway.json
└── README.md
```

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Razorpay test account

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

### Seed the database

```bash
cd backend

# Wipe all collections
npm run demo:wipe

# Seed REVA University campus
npm run demo:seed

# Verify everything is ready
npm run demo:check

# Or all in one:
npm run demo:setup
```

---

## Environment Variables

### Backend (`.env`)

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb://...

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

ADMIN_SECRET=your_admin_secret

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ANTHROPIC_API_KEY=your_anthropic_key

# Optional — FCM push notifications
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Password-based registration |
| POST | `/api/auth/signin` | Password-based login |
| POST | `/api/auth/send-otp` | Send phone OTP |
| POST | `/api/auth/verify-otp` | Verify phone OTP → JWT |
| POST | `/api/auth/send-email-otp` | Send college email OTP |
| POST | `/api/auth/verify-email-otp` | Verify email OTP → JWT |
| GET | `/api/listings` | Get campus listings |
| POST | `/api/listings` | Create a listing |
| POST | `/api/listings/suggest-price` | AI price suggestion |
| POST | `/api/transactions/initiate` | Create Razorpay order |
| POST | `/api/transactions/verify-payment` | Verify payment & escrow |
| POST | `/api/transactions/:id/confirm-receipt` | Release escrow |
| POST | `/api/chat/conversations` | Start a chat |
| GET | `/api/chat/conversations` | Get all conversations |
| POST | `/api/chat/conversations/:id/messages` | Send a message |
| POST | `/api/ambassador/apply` | Apply as ambassador |
| GET | `/api/admin/analytics/demand-heatmap` | Demand analytics |
| GET | `/api/health` | Health check |

---

## Demo Flow

**Seller (Phone 1)**
1. Sign up → verify `@reva.edu.in` email → Trust Level 1
2. Post listing (e.g. Sony Headphones · ₹800 · Electronics)

**Buyer (Phone 2 / Incognito)**
1. Sign up → verify college email → Trust Level 1
2. Browse feed → find listing → open chat → message seller
3. Initiate transaction → complete Razorpay test payment
4. Confirm receipt → escrow released → rate each other

**Test Card:** `4111 1111 1111 1111` · Any future expiry · Any CVV · OTP: `1234`

---

## Team

| Name | Roll Number |
|---|---|
| Thomson Sunny | R23EF284 |
| Shreyas Reddy | R23EF253 |
| Shivarayagouda Biradar | R23EF247 |
| Sujal Patil | R23EF267 |

**REVA University · 6th Semester · AI Application Development**

---

## License

MIT — built as an academic project with production-grade architecture.
