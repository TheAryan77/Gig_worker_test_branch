# TrustHire Backend

Express backend for TrustHire freelancing platform. Handles chat (Gemini AI), payments (Razorpay), and all database operations via Firebase Admin.

## Features
- 🤖 AI Chat assistant powered by Gemini
- 💳 Payment processing via Razorpay (orders + verification)
- 👤 User profile management (clients, freelancers, workers)
- 💼 Job posting and browsing
- 📝 Application management
- 🚀 Project lifecycle management
- 💬 Real-time project messaging
- 💰 Transactions and earnings tracking
- 🏦 Withdrawal requests

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install deps: `npm install` (from `backend/`).
3. Start dev server: `npm run dev` (default port 4000).
4. For production: `npm start`

## Routes Overview
- **Chat:** `/api/chat` - Gemini-backed AI assistant
- **Payments:** `/api/razorpay/*` - Razorpay order creation & verification
- **Users:** `/api/users/*` - Profile management
- **Jobs:** `/api/jobs/*` - Job CRUD operations
- **Applications:** `/api/applications/*` - Job applications
- **Projects:** `/api/projects/*` - Project management, messages, payments
- **Transactions:** `/api/transactions/*`, `/api/withdrawals`, `/api/earnings/:userId`
- **Health:** `/api/health` - Health check

See [API_DOCS.md](API_DOCS.md) for complete API documentation.

## Environment Variables
```bash
# Server
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Firebase Admin (service account)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=service-account@example.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX\n-----END PRIVATE KEY-----\n"
```

## Firebase Admin Setup
1. Go to Firebase Console > Project Settings > Service Accounts
2. Generate new private key (downloads JSON file)
3. Extract values from JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep `\n` newlines in quotes)

## CORS Configuration
Set `ALLOWED_ORIGINS` to comma-separated list of allowed origins:
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

Use `*` for development only (allows all origins).

## Database Collections
- `users` - User profiles (clients, freelancers, workers)
- `jobs` - Job postings
- `applications` - Job applications
- `projects` - Active projects with sub-collection `messages`
- `transactions` - Payment transactions
- `withdrawals` - Withdrawal requests
- `payments` - Razorpay order tracking

## Development
```bash
npm run dev  # Starts with nodemon for auto-reload
```

## Production
```bash
npm start
```
