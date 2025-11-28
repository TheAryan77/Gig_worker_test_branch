# TrustHire - Quick Start Guide

Complete setup guide for the TrustHire freelancing platform with separate frontend and backend.

## 🏗️ Architecture

```
TrustHire/
├── frontend/          # Next.js 15 app (UI/UX)
├── backend/           # Express.js API (Business logic & DB)
└── contracts/         # Ethereum smart contracts (Escrow)
```

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase project created
- Razorpay account (test mode is fine)
- Gemini API key (optional, has fallback)

## 🚀 Quick Start

### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Run setup script
./setup.sh

# Edit .env file with your credentials
nano .env  # or use any editor

# Start backend
npm run dev
```

Backend runs at: `http://localhost:4000`

### 2. Frontend Setup (2 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install

# Backend URL is already configured in .env.local
# Start frontend
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 3. Verify Setup

1. **Backend health check:**
   - Open: http://localhost:4000/api/health
   - Should see: `{"status":"ok","timestamp":"..."}`

2. **Frontend:**
   - Open: http://localhost:3000
   - Should see landing page
   - Chat button should work (AI assistant)

## 🔑 Environment Variables

### Backend (.env)

```bash
# Server
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000

# Gemini AI (for chatbot)
GEMINI_API_KEY=your_gemini_api_key

# Razorpay (for payments)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Firebase Admin (from service account JSON)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=service-account@example.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX\n-----END PRIVATE KEY-----\n"
```

**Getting Firebase Admin credentials:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key" → Download JSON
3. Extract values from JSON file to .env

### Frontend (.env.local)

Already configured! Just verify these are present:

```bash
# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase configs

# Razorpay (public key)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_public_key

# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

## 📱 Usage Flow

### As a Client (Hiring)

1. **Sign Up** → http://localhost:3000/signup?role=client
2. **Post a Job** → Dashboard → Post Job
3. **Review Applications** → Dashboard → Applications tab
4. **Hire Freelancer** → Approve application → Creates project
5. **Sign Agreement** → Project page → Agreement tab
6. **Make Payment** → Project page → Secure payment in escrow
7. **Track Progress** → Project page → Progress tab
8. **Release Payment** → When satisfied → Release escrow
9. **Rate Freelancer** → Leave feedback

### As a Freelancer (Working)

1. **Sign Up** → http://localhost:3000/signup?role=freelancer&type=coder
2. **Complete Profile** → Add skills, rates, experience
3. **Browse Jobs** → Dashboard → Browse tab
4. **Apply to Jobs** → Click Apply → Submit application
5. **Sign Agreement** → When hired → Project page
6. **Work on Project** → Update stages → Communicate
7. **Receive Payment** → Auto-added to balance when released
8. **Withdraw Funds** → Earnings page → Request withdrawal

### As a Worker (Service Provider)

1. **Sign Up** → http://localhost:3000/signup?role=worker&category=plumber
2. **Complete Profile** → Add skills, service area, rates
3. **Browse Jobs** → Similar to freelancer flow
4. Rest of the flow is same as freelancer

## 🎯 Key Features to Test

- ✅ **User Authentication** (Firebase Auth)
- ✅ **Job Posting** (clients)
- ✅ **Job Browsing** (freelancers/workers)
- ✅ **Applications** (submit & approve)
- ✅ **Project Creation** (automatic after hiring)
- ✅ **Agreement Signing** (both parties)
- ✅ **Escrow Payments** (Razorpay or Crypto)
- ✅ **Project Chat** (real-time messaging)
- ✅ **Stage Management** (track progress)
- ✅ **Payment Release** (to freelancer)
- ✅ **Earnings & Withdrawals** (freelancer dashboard)
- ✅ **AI Chatbot** (help & support)

## 🐛 Troubleshooting

### Backend Issues

**"Database not configured"**
- Check Firebase credentials in backend `.env`
- Verify `FIREBASE_PRIVATE_KEY` has proper `\n` newlines
- Restart backend after editing `.env`

**Port 4000 already in use**
- Change `PORT` in backend `.env`
- Update `NEXT_PUBLIC_BACKEND_URL` in frontend

**CORS errors**
- Add your frontend URL to `ALLOWED_ORIGINS` in backend `.env`
- Format: `http://localhost:3000` (no trailing slash)

### Frontend Issues

**"Failed to fetch" / API errors**
- Verify backend is running at `http://localhost:4000/api/health`
- Check `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local`
- Check browser console for actual error messages

**Firebase authentication not working**
- Verify Firebase config in `frontend/.env.local`
- Check Firebase Console → Authentication is enabled
- Enable Email/Password sign-in method

**Razorpay payment fails**
- Using test mode? Use test card: 4111 1111 1111 1111
- Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
- Verify keys are for same Razorpay account (test/live)

## 📚 Documentation

- **Backend API:** `backend/API_DOCS.md` - Complete API reference
- **Migration Guide:** `MIGRATION_GUIDE.md` - Moving from Firebase to Backend
- **Backend Summary:** `BACKEND_SUMMARY.md` - Implementation details
- **Backend Setup:** `backend/README.md` - Detailed setup guide

## 🔄 Development Workflow

### Running Both Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Making Changes

**Backend changes:**
- Edit files in `backend/src/routes/`
- Server auto-restarts (nodemon)
- Test with `curl` or Postman

**Frontend changes:**
- Edit files in `frontend/app/` or `frontend/components/`
- Hot reload automatically
- Use `api` client from `@/lib/api`

## 🚢 Deployment

### Backend Deployment

**Recommended:** Railway, Render, or AWS

1. Push code to GitHub
2. Connect repo to hosting platform
3. Set environment variables
4. Deploy!

**Environment for production:**
- Update `ALLOWED_ORIGINS` with your frontend domain
- Use production Firebase project
- Use live Razorpay keys

### Frontend Deployment

**Recommended:** Vercel (optimal for Next.js)

1. Push code to GitHub
2. Import to Vercel
3. Set `NEXT_PUBLIC_BACKEND_URL` to your backend URL
4. Deploy!

## 🎓 Learning Resources

- **Next.js:** https://nextjs.org/docs
- **Express.js:** https://expressjs.com/
- **Firebase:** https://firebase.google.com/docs
- **Razorpay:** https://razorpay.com/docs/

## 💡 Tips

1. **Start simple:** Test with just chat and user profiles first
2. **Use hybrid approach:** Keep Firebase real-time, use backend for mutations
3. **Monitor logs:** Check backend terminal for API calls
4. **Test payments:** Use Razorpay test mode (no real money)
5. **Read docs:** API_DOCS.md has all endpoints with examples

## ✅ Checklist

- [ ] Backend running at :4000
- [ ] Frontend running at :3000
- [ ] Health check works: http://localhost:4000/api/health
- [ ] Can sign up new user
- [ ] Can post a job
- [ ] Can browse jobs
- [ ] Can apply to job
- [ ] Can hire freelancer
- [ ] Can sign agreement
- [ ] Can make test payment
- [ ] Can send messages
- [ ] Chat bot works

## 🆘 Need Help?

1. Check relevant documentation file
2. Look at backend console logs
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
5. Ensure both servers are running

---

**Happy Coding! 🚀**

All systems are ready. Backend handles data, frontend handles UI, and they work together seamlessly.
