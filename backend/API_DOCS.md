# TrustHire Backend API Documentation

Base URL: `http://localhost:4000/api` (development)

## Authentication
Currently uses Firebase Auth on the frontend. Backend expects authenticated user IDs in request bodies/params.

---

## Health Check

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-16T10:30:00.000Z"
}
```

---

## Chat

### POST /chat
AI chatbot endpoint using Gemini.

**Request:**
```json
{
  "message": "How does TrustHire work?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response:**
```json
{
  "response": "TrustHire is a freelancing platform..."
}
```

---

## Razorpay Payments

### POST /razorpay/create-order
Create a Razorpay payment order.

**Request:**
```json
{
  "amount": 5000,
  "currency": "INR",
  "projectId": "proj123",
  "clientId": "user123",
  "freelancerId": "user456",
  "projectTitle": "Website Development"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_xyz",
    "amount": 500000,
    "currency": "INR",
    "receipt": "project_proj123_1234567890"
  }
}
```

### POST /razorpay/verify-payment
Verify Razorpay payment signature.

**Request:**
```json
{
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_abc",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "paymentId": "pay_abc",
  "orderId": "order_xyz"
}
```

---

## Users

### GET /users/:userId
Get user profile by ID.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "freelancer",
    "hourlyRate": 50,
    "techStack": ["React", "Node.js"],
    "availableBalance": 2500
  }
}
```

### PUT /users/:userId
Update user profile.

**Request:**
```json
{
  "name": "John Updated",
  "bio": "Full-stack developer with 5 years experience",
  "location": "New York"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### POST /users/:userId/freelancer-profile
Complete freelancer profile setup.

**Request:**
```json
{
  "hourlyRate": 50,
  "experience": "5-7 years",
  "responseTime": "Within 24 hours",
  "techStack": ["React", "Node.js", "MongoDB"],
  "bio": "Full-stack developer...",
  "location": "New York",
  "profession": "Full Stack Developer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Freelancer profile completed"
}
```

### POST /users/:userId/worker-profile
Complete worker profile setup.

**Request:**
```json
{
  "experience": "3-5 years",
  "availability": "Full-time (8+ hours/day)",
  "serviceArea": "Within 10 km",
  "hourlyRate": 25,
  "skills": ["Plumbing", "Leak repairs", "Installation"],
  "bio": "Professional plumber...",
  "phone": "+1234567890",
  "location": "Brooklyn, NY"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Worker profile completed"
}
```

---

## Jobs

### POST /jobs
Create a new job posting.

**Request:**
```json
{
  "clientId": "user123",
  "clientName": "Jane Smith",
  "jobCategory": "freelancer",
  "title": "Build E-commerce Website",
  "description": "Need a full-stack developer...",
  "profession": "Full Stack Developer",
  "techStack": ["React", "Node.js", "MongoDB"],
  "minBudget": 3000,
  "maxBudget": 5000,
  "budget": "$3000 - $5000",
  "duration": "1-2 months"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "job123",
  "message": "Job posted successfully"
}
```

### GET /jobs
Get jobs with optional filters.

**Query params:**
- `clientId` - Filter by client
- `status` - Filter by status (open, in-progress, completed)
- `jobCategory` - Filter by category (freelancer, worker)
- `limit` - Max results (default: 50)

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "job123",
      "title": "Build E-commerce Website",
      "clientName": "Jane Smith",
      "budget": "$3000 - $5000",
      "status": "open",
      "proposals": 5,
      "createdAt": "2024-12-16T10:00:00.000Z"
    }
  ]
}
```

### GET /jobs/:jobId
Get single job details.

### PUT /jobs/:jobId
Update job.

### POST /jobs/:jobId/increment-proposals
Increment proposal count for a job.

**Response:**
```json
{
  "success": true,
  "proposals": 6
}
```

---

## Applications

### POST /applications
Submit job application.

**Request:**
```json
{
  "jobId": "job123",
  "jobTitle": "Build E-commerce Website",
  "clientId": "user123",
  "clientName": "Jane Smith",
  "freelancerId": "user456",
  "freelancerName": "John Doe",
  "freelancerProfile": {
    "hourlyRate": 50,
    "experience": "5-7 years",
    "techStack": ["React", "Node.js"]
  },
  "budget": "$3000 - $5000"
}
```

**Response:**
```json
{
  "success": true,
  "applicationId": "app123",
  "message": "Application submitted successfully"
}
```

### GET /applications
Get applications with filters.

**Query params:**
- `jobId` - Filter by job
- `freelancerId` - Filter by freelancer
- `clientId` - Filter by client
- `status` - Filter by status (pending, approved, rejected)
- `limit` - Max results (default: 50)

**Response:**
```json
{
  "success": true,
  "applications": [
    {
      "id": "app123",
      "jobTitle": "Build E-commerce Website",
      "freelancerName": "John Doe",
      "status": "pending",
      "appliedAt": "2024-12-16T10:00:00.000Z"
    }
  ]
}
```

### PUT /applications/:applicationId
Update application status.

**Request:**
```json
{
  "status": "approved",
  "projectId": "proj123",
  "progress": 0
}
```

### POST /applications/batch-reject
Reject other applications for a job.

**Request:**
```json
{
  "jobId": "job123",
  "excludeApplicationId": "app123"
}
```

---

## Projects

### POST /projects
Create a new project.

**Request:**
```json
{
  "jobId": "job123",
  "jobTitle": "Build E-commerce Website",
  "description": "Full-stack e-commerce...",
  "clientId": "user123",
  "clientName": "Jane Smith",
  "freelancerId": "user456",
  "freelancerName": "John Doe",
  "budget": "$3000 - $5000",
  "budgetAmount": 4000
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "proj123",
  "message": "Project created successfully"
}
```

### GET /projects/:projectId
Get project details.

### GET /projects
Get projects with filters.

**Query params:**
- `clientId` - Filter by client
- `freelancerId` - Filter by freelancer
- `status` - Filter by status
- `limit` - Max results (default: 50)

### PUT /projects/:projectId
Update project.

### POST /projects/:projectId/sign-agreement
Sign project agreement.

**Request:**
```json
{
  "userRole": "client",
  "userName": "Jane Smith"
}
```

**Response:**
```json
{
  "success": true,
  "bothAgreed": true
}
```

### POST /projects/:projectId/secure-payment
Secure payment in escrow.

**Request:**
```json
{
  "escrowAmount": 4000,
  "paymentMethod": "razorpay",
  "paymentId": "pay_abc",
  "orderId": "order_xyz"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment secured successfully"
}
```

### PUT /projects/:projectId/stages/:stageIndex
Update project stage status.

**Request:**
```json
{
  "status": "completed"
}
```

### POST /projects/:projectId/release-payment
Release escrow payment to freelancer.

**Response:**
```json
{
  "success": true,
  "message": "Payment released successfully"
}
```

### POST /projects/:projectId/rating
Submit project rating.

**Request:**
```json
{
  "stars": 5,
  "feedback": "Excellent work!"
}
```

### GET /projects/:projectId/messages
Get project messages.

**Query params:**
- `limit` - Max messages (default: 100)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg123",
      "senderId": "user123",
      "senderName": "Jane Smith",
      "senderRole": "client",
      "content": "How's the progress?",
      "type": "text",
      "createdAt": "2024-12-16T10:00:00.000Z"
    }
  ]
}
```

### POST /projects/:projectId/messages
Send a message.

**Request:**
```json
{
  "senderId": "user123",
  "senderName": "Jane Smith",
  "senderRole": "client",
  "content": "How's the progress?",
  "type": "text"
}
```

---

## Transactions & Earnings

### GET /transactions
Get transaction history.

**Query params:**
- `freelancerId` - Filter by freelancer
- `clientId` - Filter by client
- `limit` - Max results (default: 50)

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "txn123",
      "type": "escrow_release",
      "amount": 4000,
      "projectId": "proj123",
      "status": "completed",
      "createdAt": "2024-12-16T10:00:00.000Z"
    }
  ]
}
```

### POST /transactions
Create transaction record.

### POST /withdrawals
Request withdrawal.

**Request:**
```json
{
  "userId": "user456",
  "amount": 2000,
  "method": "Bank Transfer",
  "accountDetails": {
    "accountNumber": "123456789",
    "ifsc": "BANK0001234"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully",
  "newBalance": 500
}
```

### GET /earnings/:userId
Get user earnings summary.

**Response:**
```json
{
  "success": true,
  "earnings": {
    "availableBalance": 2500,
    "totalEarnings": 10000,
    "totalWithdrawn": 7500,
    "transactions": [...]
  }
}
```

---

## Error Responses

All endpoints return standard error format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request
- `404` - Not found
- `500` - Server error
