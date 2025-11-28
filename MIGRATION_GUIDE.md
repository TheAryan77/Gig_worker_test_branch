# Frontend Migration Guide

This guide helps you migrate from direct Firebase calls to backend API calls.

## Setup

1. **Set backend URL** in `frontend/.env.local`:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

2. **Import the API client** in your components:
```typescript
import { api } from "@/lib/api";
```

## Migration Examples

### User Profile Operations

**Before (Direct Firebase):**
```typescript
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Get user
const userDoc = await getDoc(doc(db, "users", userId));
const userData = userDoc.data();

// Update user
await updateDoc(doc(db, "users", userId), {
  name: "New Name",
  bio: "Updated bio"
});
```

**After (Backend API):**
```typescript
import { api } from "@/lib/api";

// Get user
const { user } = await api.getUser(userId);

// Update user
await api.updateUser(userId, {
  name: "New Name",
  bio: "Updated bio"
});
```

### Job Posting

**Before:**
```typescript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const jobData = {
  clientId: userId,
  title: "Build Website",
  description: "...",
  budget: "$3000 - $5000",
  status: "open",
  createdAt: serverTimestamp()
};

const docRef = await addDoc(collection(db, "jobs"), jobData);
```

**After:**
```typescript
import { api } from "@/lib/api";

const jobData = {
  clientId: userId,
  title: "Build Website",
  description: "...",
  budget: "$3000 - $5000"
};

const { jobId } = await api.createJob(jobData);
```

### Fetching Jobs

**Before:**
```typescript
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const q = query(
  collection(db, "jobs"),
  where("status", "==", "open")
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const jobs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setJobs(jobs);
});
```

**After:**
```typescript
import { api } from "@/lib/api";

// One-time fetch
const { jobs } = await api.getJobs({ status: "open" });
setJobs(jobs);

// For real-time updates, you can poll or use a separate websocket solution
// Or keep using Firebase's onSnapshot for now and migrate gradually
```

### Job Applications

**Before:**
```typescript
import { collection, addDoc, updateDoc, doc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Apply to job
await addDoc(collection(db, "applications"), {
  jobId,
  freelancerId: userId,
  status: "pending",
  appliedAt: serverTimestamp()
});

// Increment proposals
await updateDoc(doc(db, "jobs", jobId), {
  proposals: increment(1)
});
```

**After:**
```typescript
import { api } from "@/lib/api";

// Apply to job
await api.createApplication({
  jobId,
  freelancerId: userId,
  freelancerName,
  // ... other data
});

// Increment proposals
await api.incrementJobProposals(jobId);
```

### Project Creation & Management

**Before:**
```typescript
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Create project
const projectRef = await addDoc(collection(db, "projects"), {
  jobId,
  clientId,
  freelancerId,
  status: "pending-agreement",
  stages: [...]
});

// Update project
await updateDoc(doc(db, "projects", projectId), {
  clientAgreed: true,
  status: "pending-payment"
});
```

**After:**
```typescript
import { api } from "@/lib/api";

// Create project
const { projectId } = await api.createProject({
  jobId,
  clientId,
  freelancerId,
  // Backend sets defaults
});

// Sign agreement
await api.signAgreement(projectId, "client", userName);

// Secure payment
await api.securePayment(projectId, {
  escrowAmount: 4000,
  paymentMethod: "razorpay",
  paymentId,
  orderId
});
```

### Project Messages

**Before:**
```typescript
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Send message
await addDoc(collection(db, "projects", projectId, "messages"), {
  senderId: userId,
  content: message,
  createdAt: serverTimestamp()
});

// Subscribe to messages
const q = query(
  collection(db, "projects", projectId, "messages"),
  orderBy("createdAt", "asc")
);

onSnapshot(q, (snapshot) => {
  const messages = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setMessages(messages);
});
```

**After:**
```typescript
import { api } from "@/lib/api";

// Send message
await api.sendProjectMessage(projectId, {
  senderId: userId,
  senderName: userName,
  senderRole: "client",
  content: message,
  type: "text"
});

// Fetch messages (one-time)
const { messages } = await api.getProjectMessages(projectId);
setMessages(messages);

// For real-time, continue using Firebase onSnapshot or implement polling
```

### Transactions & Earnings

**Before:**
```typescript
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Get transactions
const q = query(
  collection(db, "transactions"),
  where("freelancerId", "==", userId)
);
const snapshot = await getDocs(q);
const transactions = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

// Create withdrawal
await addDoc(collection(db, "transactions"), {
  type: "withdrawal",
  amount,
  freelancerId: userId
});

await addDoc(collection(db, "withdrawals"), {
  userId,
  amount,
  method,
  status: "pending"
});
```

**After:**
```typescript
import { api } from "@/lib/api";

// Get earnings summary (includes transactions)
const { earnings } = await api.getEarnings(userId);
const { availableBalance, totalEarnings, transactions } = earnings;

// Request withdrawal
await api.requestWithdrawal({
  userId,
  amount,
  method: "Bank Transfer",
  accountDetails: { ... }
});
```

### Profile Setup

**Before:**
```typescript
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Freelancer profile
await updateDoc(doc(db, "users", userId), {
  hourlyRate: 50,
  techStack: ["React", "Node.js"],
  profileCompleted: true
});
```

**After:**
```typescript
import { api } from "@/lib/api";

// Freelancer profile
await api.completeFreelancerProfile(userId, {
  hourlyRate: 50,
  techStack: ["React", "Node.js"],
  experience: "5-7 years",
  // Backend sets profileCompleted automatically
});

// Worker profile
await api.completeWorkerProfile(userId, {
  hourlyRate: 25,
  skills: ["Plumbing", "Repairs"],
  availability: "Full-time"
});
```

## Hybrid Approach (Recommended for Gradual Migration)

You can keep using Firebase's real-time features for live updates while using the backend API for mutations:

```typescript
import { api } from "@/lib/api";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Use backend for creating/updating
const handleApply = async () => {
  await api.createApplication({ ...applicationData });
  await api.incrementJobProposals(jobId);
};

// Keep Firebase for real-time listening
useEffect(() => {
  const q = query(
    collection(db, "applications"),
    where("freelancerId", "==", userId)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setApplications(apps);
  });

  return () => unsubscribe();
}, [userId]);
```

## Error Handling

The API client throws errors that you should catch:

```typescript
try {
  const { jobId } = await api.createJob(jobData);
  router.push("/client/dashboard");
} catch (error) {
  console.error("Failed to create job:", error);
  setError(error.message || "Failed to create job");
}
```

## Authentication

The backend doesn't handle authentication directly. Continue using Firebase Auth on the frontend:

```typescript
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserId(user.uid);
      // Now use API with userId
      api.getUser(user.uid).then(({ user }) => {
        setUserData(user);
      });
    } else {
      router.push("/login");
    }
  });

  return () => unsubscribe();
}, []);
```

## Migration Checklist

For each component:

- [ ] Replace `addDoc` with `api.create*`
- [ ] Replace `updateDoc` with `api.update*`
- [ ] Replace `getDoc` with `api.get*`
- [ ] Replace `getDocs` + `query` with `api.get*` (plural methods)
- [ ] Remove `serverTimestamp()` (backend handles timestamps)
- [ ] Remove direct Firebase imports where replaced
- [ ] Update error handling
- [ ] Test all functionality
- [ ] Keep `onSnapshot` for real-time features (optional: migrate later)

## Benefits of Backend API

1. **Security**: Firebase rules are bypassed; all validation in backend
2. **Business Logic**: Complex operations (escrow release, batch updates) in one place
3. **Flexibility**: Easier to add features, logging, analytics
4. **Testing**: Backend APIs are easier to test than client-side Firebase code
5. **Monitoring**: Centralized error logging and monitoring
6. **Rate Limiting**: Can add rate limiting, authentication checks at API level

## Next Steps

1. Start with **new features** using the backend API
2. Gradually migrate **critical paths** (payments, job creation)
3. Keep **real-time features** on Firebase (applications list, messages)
4. Once stable, consider adding WebSockets for real-time backend events
