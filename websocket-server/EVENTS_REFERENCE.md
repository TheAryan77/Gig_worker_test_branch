# WebSocket Server - API Documentation

Complete reference for all Socket.IO events in the TrustHire WebSocket server.

## Table of Contents

- [Connection Management](#connection-management)
- [Agreement Events](#agreement-events)
- [Messaging Events](#messaging-events)
- [Project Status Events](#project-status-events)
- [User Presence Events](#user-presence-events)

---

## Connection Management

### Client Connects

**Event:** `connection` (automatic)

When a client connects to the Socket.IO server.

```javascript
// Server automatically handles this
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});
```

---

### User Join

**Event:** `user:join`  
**Direction:** Client → Server  
**Description:** Associate a user ID with the socket connection

**Payload:**
```javascript
socket.emit('user:join', userId);
// userId: string - The user's Firebase Auth ID
```

**Response:** `user:connected`
```javascript
socket.on('user:connected', (data) => {
  // data: { userId: string, socketId: string }
});
```

---

### Project Room Management

#### Join Project

**Event:** `project:join`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('project:join', {
  projectId: 'proj_123',
  userId: 'user_456'
});
```

**Response:** `project:joined`
```javascript
socket.on('project:joined', (data) => {
  // data: { projectId: string }
});
```

**Broadcast:** `user:joined-project` (to others in room)
```javascript
socket.on('user:joined-project', (data) => {
  // data: { projectId, userId, timestamp }
});
```

---

#### Leave Project

**Event:** `project:leave`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('project:leave', {
  projectId: 'proj_123',
  userId: 'user_456'
});
```

**Broadcast:** `user:left-project`
```javascript
socket.on('user:left-project', (data) => {
  // data: { projectId, userId, timestamp }
});
```

---

## Agreement Events

### Sign Agreement

**Event:** `agreement:sign`  
**Direction:** Client → Server  
**Description:** User (client or freelancer/worker) signs the agreement

**Payload:**
```javascript
socket.emit('agreement:sign', {
  projectId: 'proj_123',
  userId: 'user_456',
  userType: 'client', // or 'freelancer' or 'worker'
  userName: 'John Doe',
  timestamp: new Date().toISOString()
});
```

**Response:** `agreement:sign-confirmed` (to sender)
```javascript
socket.on('agreement:sign-confirmed', (data) => {
  // data: { projectId, userId, userType, timestamp }
});
```

**Broadcast:** `agreement:signed` (to others)
```javascript
socket.on('agreement:signed', (data) => {
  /*
  data: {
    projectId: 'proj_123',
    signedBy: {
      userId: 'user_456',
      userType: 'client',
      userName: 'John Doe'
    },
    timestamp: '2025-12-16T10:30:00Z',
    message: 'John Doe has signed the agreement'
  }
  */
});
```

---

### Agreement Completed

**Event:** `agreement:completed`  
**Direction:** Client → Server (typically triggered by backend)  
**Description:** Both parties have signed the agreement

**Payload:**
```javascript
socket.emit('agreement:completed', {
  projectId: 'proj_123',
  agreement: {
    clientSignature: { userId, timestamp },
    freelancerSignature: { userId, timestamp },
    terms: { /* agreement terms */ }
  }
});
```

**Broadcast:** `agreement:complete` (to all in room)
```javascript
socket.on('agreement:complete', (data) => {
  /*
  data: {
    projectId: 'proj_123',
    agreement: { ... },
    timestamp: '2025-12-16T10:35:00Z',
    message: 'Agreement has been signed by both parties',
    status: 'completed'
  }
  */
});
```

---

### View Agreement

**Event:** `agreement:view`  
**Direction:** Client → Server  
**Description:** Track who's viewing the agreement

**Payload:**
```javascript
socket.emit('agreement:view', {
  projectId: 'proj_123',
  userId: 'user_456',
  userName: 'John Doe'
});
```

**Broadcast:** `agreement:viewing` (to others)
```javascript
socket.on('agreement:viewing', (data) => {
  // data: { projectId, viewer: { userId, userName }, timestamp }
});
```

---

### Negotiate Agreement

**Event:** `agreement:negotiate`  
**Direction:** Client → Server  
**Description:** Request changes to the agreement

**Payload:**
```javascript
socket.emit('agreement:negotiate', {
  projectId: 'proj_123',
  userId: 'user_456',
  userName: 'John Doe',
  changes: {
    payment: 5000,
    stages: 4,
    deadline: '2026-01-15'
  },
  message: 'Can we extend the deadline by 2 weeks?'
});
```

**Broadcast:** `agreement:negotiation-request`
```javascript
socket.on('agreement:negotiation-request', (data) => {
  /*
  data: {
    projectId, 
    requestedBy: { userId, userName },
    changes: { ... },
    message: '...',
    timestamp
  }
  */
});
```

---

### Cancel Agreement

**Event:** `agreement:cancel`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('agreement:cancel', {
  projectId: 'proj_123',
  userId: 'user_456',
  userName: 'John Doe',
  reason: 'Project requirements changed'
});
```

**Broadcast:** `agreement:cancelled`
```javascript
socket.on('agreement:cancelled', (data) => {
  // data: { projectId, cancelledBy: { userId, userName }, reason, timestamp }
});
```

---

## Messaging Events

### Send Message

**Event:** `message:send`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('message:send', {
  projectId: 'proj_123',
  messageId: 'msg_789', // unique ID
  senderId: 'user_456',
  senderName: 'John Doe',
  senderType: 'client', // or 'freelancer'/'worker'
  content: 'Hello! How is the progress?',
  timestamp: new Date().toISOString(),
  type: 'text', // or 'file', 'system'
  
  // Optional for file messages:
  fileUrl: 'https://...',
  fileName: 'document.pdf'
});
```

**Response:** `message:delivered` (to sender)
```javascript
socket.on('message:delivered', (data) => {
  // data: { projectId, messageId, timestamp }
});
```

**Broadcast:** `message:new` (to all in room)
```javascript
socket.on('message:new', (data) => {
  /*
  data: {
    projectId: 'proj_123',
    message: {
      id: 'msg_789',
      senderId: 'user_456',
      senderName: 'John Doe',
      senderType: 'client',
      content: 'Hello! How is the progress?',
      type: 'text',
      timestamp: '2025-12-16T10:40:00Z',
      status: 'sent'
    }
  }
  */
});
```

---

### Typing Indicators

#### Start Typing

**Event:** `message:typing-start`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('message:typing-start', {
  projectId: 'proj_123',
  userId: 'user_456',
  userName: 'John Doe'
});
```

**Broadcast:** `user:typing` (to others)
```javascript
socket.on('user:typing', (data) => {
  // data: { projectId, userId, userName }
  // Show "John Doe is typing..."
});
```

---

#### Stop Typing

**Event:** `message:typing-stop`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('message:typing-stop', {
  projectId: 'proj_123',
  userId: 'user_456'
});
```

**Broadcast:** `user:stopped-typing`
```javascript
socket.on('user:stopped-typing', (data) => {
  // data: { projectId, userId }
  // Hide typing indicator
});
```

---

### Read Receipts

**Event:** `message:read`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('message:read', {
  projectId: 'proj_123',
  userId: 'user_456',
  messageIds: ['msg_789', 'msg_790', 'msg_791']
});
```

**Broadcast:** `messages:read`
```javascript
socket.on('messages:read', (data) => {
  /*
  data: {
    projectId: 'proj_123',
    userId: 'user_456',
    messageIds: ['msg_789', 'msg_790'],
    timestamp: '2025-12-16T10:45:00Z'
  }
  */
});
```

---

### Edit Message

**Event:** `message:edit`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('message:edit', {
  projectId: 'proj_123',
  messageId: 'msg_789',
  userId: 'user_456',
  newContent: 'Updated message content'
});
```

**Broadcast:** `message:edited`
```javascript
socket.on('message:edited', (data) => {
  // data: { projectId, messageId, editedBy, newContent, editedAt }
});
```

---

### Delete Message

**Event:** `message:delete`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('message:delete', {
  projectId: 'proj_123',
  messageId: 'msg_789',
  userId: 'user_456'
});
```

**Broadcast:** `message:deleted`
```javascript
socket.on('message:deleted', (data) => {
  // data: { projectId, messageId, deletedBy, timestamp }
});
```

---

## Project Status Events

### Status Change

**Event:** `project:status-change`  
**Direction:** Client → Server (typically from backend)

**Payload:**
```javascript
socket.emit('project:status-change', {
  projectId: 'proj_123',
  oldStatus: 'agreement-signing',
  newStatus: 'pending-payment',
  changedBy: 'user_456',
  reason: 'Both parties signed the agreement'
});
```

**Broadcast:** `project:status-updated`
```javascript
socket.on('project:status-updated', (data) => {
  // data: { projectId, oldStatus, newStatus, changedBy, reason, timestamp }
});
```

---

### Payment Secured

**Event:** `project:payment-secured`  
**Direction:** Client → Server (from backend after payment)

**Payload:**
```javascript
socket.emit('project:payment-secured', {
  projectId: 'proj_123',
  amount: 5000,
  currency: 'INR',
  paymentId: 'pay_xyz123'
});
```

**Broadcast:** `project:payment-confirmed`
```javascript
socket.on('project:payment-confirmed', (data) => {
  /*
  data: {
    projectId: 'proj_123',
    payment: {
      amount: 5000,
      currency: 'INR',
      paymentId: 'pay_xyz123',
      status: 'secured'
    },
    timestamp: '2025-12-16T11:00:00Z',
    message: 'Payment has been secured in escrow'
  }
  */
});
```

---

### Stage Update

**Event:** `project:stage-update`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('project:stage-update', {
  projectId: 'proj_123',
  stageNumber: 2,
  stageStatus: 'completed', // 'in-progress', 'completed', 'approved'
  updatedBy: 'user_456',
  description: 'Backend API completed and tested'
});
```

**Broadcast:** `project:stage-updated`
```javascript
socket.on('project:stage-updated', (data) => {
  /*
  data: {
    projectId: 'proj_123',
    stage: {
      number: 2,
      status: 'completed',
      description: '...',
      updatedBy: 'user_456'
    },
    timestamp: '2025-12-16T11:30:00Z'
  }
  */
});
```

---

### Payment Released

**Event:** `project:payment-released`  
**Direction:** Client → Server (from backend)

**Payload:**
```javascript
socket.emit('project:payment-released', {
  projectId: 'proj_123',
  amount: 5000,
  currency: 'INR',
  recipientId: 'freelancer_789'
});
```

**Broadcast:** `project:payment-released-notification`
```javascript
socket.on('project:payment-released-notification', (data) => {
  /*
  data: {
    projectId: 'proj_123',
    payment: {
      amount: 5000,
      currency: 'INR',
      recipientId: 'freelancer_789',
      status: 'released'
    },
    timestamp: '2025-12-16T12:00:00Z',
    message: 'Payment has been released from escrow'
  }
  */
});
```

---

### Project Completed

**Event:** `project:complete`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('project:complete', {
  projectId: 'proj_123',
  completedBy: 'user_456'
});
```

**Broadcast:** `project:completed`
```javascript
socket.on('project:completed', (data) => {
  /*
  data: {
    projectId: 'proj_123',
    completedBy: 'user_456',
    timestamp: '2025-12-16T12:30:00Z',
    message: 'Project has been marked as completed'
  }
  */
});
```

---

### Rating Submitted

**Event:** `project:rating-submitted`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('project:rating-submitted', {
  projectId: 'proj_123',
  raterId: 'user_456',
  raterType: 'client', // or 'freelancer'/'worker'
  rating: 5,
  review: 'Excellent work! Very professional and timely.'
});
```

**Broadcast:** `project:rating-received`
```javascript
socket.on('project:rating-received', (data) => {
  /*
  data: {
    projectId: 'proj_123',
    rating: {
      raterId: 'user_456',
      raterType: 'client',
      rating: 5,
      review: 'Excellent work! ...'
    },
    timestamp: '2025-12-16T13:00:00Z'
  }
  */
});
```

---

### Dispute Raised

**Event:** `project:dispute`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('project:dispute', {
  projectId: 'proj_123',
  raisedBy: 'user_456',
  reason: 'Work not as agreed',
  description: 'The delivered work does not match the specifications...'
});
```

**Broadcast:** `project:dispute-raised`
```javascript
socket.on('project:dispute-raised', (data) => {
  /*
  data: {
    projectId: 'proj_123',
    dispute: {
      raisedBy: 'user_456',
      reason: 'Work not as agreed',
      description: '...',
      status: 'pending'
    },
    timestamp: '2025-12-16T14:00:00Z',
    message: 'A dispute has been raised for this project'
  }
  */
});
```

---

## User Presence Events

### User Online

**Event:** `user:online`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('user:online', {
  userId: 'user_456',
  projectIds: ['proj_123', 'proj_456'] // Projects user is part of
});
```

**Broadcast:** `user:status` (to all relevant projects)
```javascript
socket.on('user:status', (data) => {
  // data: { userId, status: 'online', timestamp }
});
```

---

### User Offline

**Event:** `user:offline`  
**Direction:** Client → Server

**Payload:**
```javascript
socket.emit('user:offline', {
  userId: 'user_456',
  projectIds: ['proj_123', 'proj_456']
});
```

**Broadcast:** `user:status`
```javascript
socket.on('user:status', (data) => {
  // data: { userId, status: 'offline', timestamp }
});
```

---

## Error Handling

All events can emit errors:

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
  // error: { message: string }
});
```

---

## Best Practices

1. **Always provide userId and projectId** - Required for most operations
2. **Generate unique messageIds** - Use UUID or timestamp-based IDs
3. **Include timestamps** - For accurate time tracking
4. **Handle disconnections** - Implement reconnection logic
5. **Clean up on unmount** - Leave rooms and disconnect properly
6. **Validate data** - Check all required fields before emitting

---

## Testing Events

Use browser console to test:

```javascript
// Connect
const socket = io('http://localhost:5000');

// Join as user
socket.emit('user:join', 'testuser123');

// Join project
socket.emit('project:join', {
  projectId: 'testproject',
  userId: 'testuser123'
});

// Send message
socket.emit('message:send', {
  projectId: 'testproject',
  messageId: 'msg' + Date.now(),
  senderId: 'testuser123',
  senderName: 'Test User',
  content: 'Hello World!',
  timestamp: new Date().toISOString()
});

// Listen for responses
socket.on('message:new', console.log);
socket.on('agreement:signed', console.log);
socket.on('project:status-updated', console.log);
```

---

**Version:** 1.0.0  
**Last Updated:** December 16, 2025
