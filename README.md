# 🚀 TrustHire - Freelancing & Gig Worker Platform

A comprehensive freelancing platform connecting clients with skilled freelancers (coders, designers) and gig workers (plumbers, electricians, etc.) with secure escrow payments.

## ⭐ Features

### For Clients
- 📝 Post jobs for freelancers or service workers
- 👥 Review applications with detailed profiles
- 🤝 Hire with milestone-based agreements
- 💰 Secure escrow payments (Razorpay/Crypto)
- 📊 Track project progress
- ⭐ Rate and review workers

### For Freelancers & Workers
- 🔍 Browse relevant job listings
- 📋 Apply to jobs with profile showcase
- 💼 Manage active projects
- 💬 Communicate with clients
- 💵 Receive secure payments
- 🏦 Track earnings and withdraw funds

### Platform Features
- 🔐 Secure authentication (Firebase Auth)
- 🤖 AI-powered chatbot assistant (Gemini)
- 💳 Multiple payment methods (UPI, Cards, Crypto)
- 📱 Responsive design (mobile-friendly)
- 🌙 Dark mode support
- 🔄 Real-time updates

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Auth:** Firebase Authentication
- **Real-time:** Firebase Firestore (optional)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Firebase Firestore (via Admin SDK)
- **Payments:** Razorpay API
- **AI:** Google Gemini API
- **Language:** JavaScript (ES Modules)

### Smart Contracts
- **Blockchain:** Ethereum
- **Framework:** Hardhat
- **Language:** Solidity

## 📁 Project Structure

```
TrustHire/
│
├── frontend/                    # Next.js 15 application
│   ├── app/                     # App router pages
│   │   ├── api/                # (Legacy) Next.js API routes
│   │   ├── client/             # Client dashboard & features
│   │   ├── freelancer/         # Freelancer dashboard & features
│   │   ├── worker/             # Worker dashboard & features
│   │   ├── project/[id]/       # Project detail page
│   │   ├── login/              # Authentication pages
│   │   └── signup/
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # UI primitives
│   │   ├── payments/           # Payment components
│   │   └── ...
│   ├── lib/                    # Utilities
│   │   ├── api.ts             # Backend API client ⭐
│   │   ├── firebase.ts        # Firebase config
│   │   └── utils.ts
│   └── .env.local             # Environment variables
│
├── backend/                    # Express.js API server ⭐
│   ├── src/
│   │   ├── routes/            # API route modules
│   │   │   ├── chat.js        # AI chatbot
│   │   │   ├── razorpay.js    # Payments
│   │   │   ├── users.js       # User management
│   │   │   ├── jobs.js        # Job CRUD
│   │   │   ├── applications.js # Job applications
│   │   │   ├── projects.js    # Project lifecycle
│   │   │   └── transactions.js # Earnings & withdrawals
│   │   ├── config/
│   │   │   └── firebase.js    # Firebase Admin
│   │   └── index.js           # Server entry point
│   ├── .env.example           # Environment template
│   ├── package.json
│   ├── API_DOCS.md           # Complete API reference ⭐
│   ├── README.md             # Backend setup guide
│   └── setup.sh              # Quick setup script
│
├── contracts/                 # Ethereum smart contracts
│   ├── contracts/
│   │   └── Escrow.sol        # Escrow contract
│   ├── scripts/
│   │   └── deploy.js
│   └── hardhat.config.js
│
├── QUICK_START.md            # Quick start guide ⭐
├── BACKEND_SUMMARY.md        # Backend implementation details
├── MIGRATION_GUIDE.md        # Frontend migration guide
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project created
- Razorpay account (test mode)
- Gemini API key (optional)

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd TrustHire

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env and add your credentials
nano .env
```

Required variables:
```bash
GEMINI_API_KEY=your_gemini_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Backend runs at: http://localhost:4000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Frontend runs at: http://localhost:3000
```

### 4. Verify Setup

- Backend health: http://localhost:4000/api/health
- Frontend: http://localhost:3000
- Test chatbot and signup flow

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](QUICK_START.md) | Step-by-step setup guide |
| [backend/API_DOCS.md](backend/API_DOCS.md) | Complete API reference with examples |
| [backend/README.md](backend/README.md) | Backend setup & architecture |
| [BACKEND_SUMMARY.md](BACKEND_SUMMARY.md) | Implementation details & features |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | Migrating from Firebase to Backend API |

## 🔑 Key Components

### Backend API Routes

| Route | Purpose |
|-------|---------|
| `/api/chat` | AI chatbot (Gemini) |
| `/api/users/*` | User profile management |
| `/api/jobs/*` | Job posting & browsing |
| `/api/applications/*` | Job applications |
| `/api/projects/*` | Project lifecycle & messaging |
| `/api/transactions/*` | Payments & earnings |
| `/api/razorpay/*` | Payment processing |

### Frontend Pages

| Path | Purpose |
|------|---------|
| `/` | Landing page |
| `/login`, `/signup` | Authentication |
| `/choice` | Role selection |
| `/client/dashboard` | Client management |
| `/freelancer/dashboard` | Browse jobs & manage work |
| `/worker/dashboard` | Worker-specific dashboard |
| `/project/[id]` | Project details & chat |
| `/client/post-job` | Create job posting |
| `*/earnings` | View earnings & withdraw |

## 🎯 User Flows

### Hiring Flow (Client)
1. Sign up as client
2. Post a job (freelancer or worker category)
3. Review applications
4. Hire applicant → Creates project
5. Both sign agreement
6. Client makes escrow payment
7. Track progress through stages
8. Release payment when satisfied
9. Rate freelancer/worker

### Working Flow (Freelancer/Worker)
1. Sign up and complete profile
2. Browse available jobs
3. Apply to relevant jobs
4. Wait for approval
5. Sign agreement when hired
6. Work on project milestones
7. Communicate via project chat
8. Receive payment when released
9. Withdraw earnings

## 🔐 Security Features

- ✅ Firebase Authentication
- ✅ Backend API validation
- ✅ Escrow payment system
- ✅ Secure Firebase Admin access
- ✅ CORS protection
- ✅ Environment variable protection
- ✅ Payment signature verification

## 💳 Payment Methods

### Razorpay (For Workers - INR)
- UPI (GPay, PhonePe, Paytm)
- Cards (Credit/Debit)
- Net Banking
- QR Code

### Crypto (For Freelancers - Global)
- MetaMask integration
- Smart contract escrow
- Ethereum blockchain

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon (auto-reload)
```

Test API endpoints:
```bash
# Health check
curl http://localhost:4000/api/health

# Create job
curl -X POST http://localhost:4000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"clientId":"user123","title":"Test Job"}'
```

### Frontend Development

```bash
cd frontend
npm run dev  # Starts Next.js dev server
```

Using the API client:
```typescript
import { api } from "@/lib/api";

// Create job
const { jobId } = await api.createJob(jobData);

// Get user
const { user } = await api.getUser(userId);
```

## 🚢 Deployment

### Backend
**Recommended:** Railway, Render, AWS, or Fly.io

1. Push code to GitHub
2. Connect to hosting platform
3. Set environment variables
4. Deploy!

### Frontend
**Recommended:** Vercel (optimized for Next.js)

1. Push code to GitHub
2. Import to Vercel
3. Set `NEXT_PUBLIC_BACKEND_URL`
4. Deploy!

### Environment Variables for Production

**Backend:**
- Update `ALLOWED_ORIGINS` with frontend domain
- Use production Firebase project
- Use live Razorpay keys

**Frontend:**
- Set `NEXT_PUBLIC_BACKEND_URL` to backend URL
- Update Firebase config for production
- Update Razorpay public key

## 🧪 Testing

### Manual Testing Checklist

- [ ] User signup/login
- [ ] Profile completion
- [ ] Job posting (client)
- [ ] Job browsing (freelancer/worker)
- [ ] Application submission
- [ ] Application approval
- [ ] Project creation
- [ ] Agreement signing
- [ ] Payment (test mode)
- [ ] Project messaging
- [ ] Stage updates
- [ ] Payment release
- [ ] Withdrawal request
- [ ] Chatbot functionality

### Test Credentials

**Razorpay Test Cards:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

## 📊 Database Schema

### Collections

- **users** - User profiles (clients, freelancers, workers)
- **jobs** - Job postings with filters
- **applications** - Job applications
- **projects** - Active projects
  - **messages** (sub-collection) - Project chat
- **transactions** - Payment history
- **withdrawals** - Withdrawal requests
- **payments** - Razorpay order tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support & Help

- **Setup Issues:** See [QUICK_START.md](QUICK_START.md)
- **API Questions:** See [backend/API_DOCS.md](backend/API_DOCS.md)
- **Migration Help:** See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **Backend Details:** See [BACKEND_SUMMARY.md](BACKEND_SUMMARY.md)

## 🌟 Features to Add (Future)

- [ ] WebSocket for real-time updates
- [ ] Email notifications
- [ ] Advanced search & filters
- [ ] File attachments in chat
- [ ] Video calling integration
- [ ] Dispute resolution system
- [ ] Admin dashboard
- [ ] Analytics & reporting
- [ ] Mobile app (React Native)

## 👥 Team

Built with ❤️ by the TrustHire Team

---

**Status:** ✅ Fully functional with comprehensive backend API

**Last Updated:** December 16, 2024

For detailed setup instructions, see [QUICK_START.md](QUICK_START.md)
