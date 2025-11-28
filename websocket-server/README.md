# 🔌 TrustHire WebSocket Server

Real-time communication server for TrustHire platform using Socket.IO. Handles agreement signing, project messaging, status updates, and all real-time interactions between clients and freelancers/workers.

## ✨ Features

### Agreement Management
- ✅ Real-time agreement signing notifications
- 🤝 Both-party signature tracking
- 🔄 Agreement negotiation/modification
- 👀 Live agreement viewing status
- 🚫 Agreement cancellation alerts

### Project Messaging
- 💬 Real-time chat between project participants
- ⌨️ Typing indicators
- ✅ Read receipts
- ✏️ Message editing
- 🗑️ Message deletion
- 📎 File upload notifications

### Project Updates
- 📊 Status change notifications
- 💰 Payment secured/released alerts
- 📈 Milestone/stage updates
- ⭐ Rating submissions
- ⚠️ Dispute notifications
- 🚫 Project cancellations
- ⏰ Deadline reminders

### User Presence
- 🟢 Online/offline status
- 👥 User joins/leaves project
- 🔔 Real-time notifications

## 🚀 Quick Start

### Installation

```bash
# Run setup script
./setup.sh

# Or manually:
npm install
cp .env.example .env
```

### Configuration

Edit `.env`:
```bash
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
NODE_ENV=development
```

### Running

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will be available at: `http://localhost:5000`

## 📡 Client Integration

### Frontend Setup (Next.js/React)

Install Socket.IO client:
```bash
npm install socket.io-client
```

Create WebSocket utility (`lib/socket.ts`):

```typescript
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### Usage Examples

#### 1. User Connection
```typescript
import { getSocket } from '@/lib/socket';

// Connect user
const socket = getSocket();
socket.emit('user:join', userId);

socket.on('user:connected', (data) => {
  console.log('Connected:', data);
});
```

#### 2. Join Project Room
```typescript
// Join a specific project for real-time updates
socket.emit('project:join', {
  projectId: 'project123',
  userId: 'user456'
});

socket.on('project:joined', (data) => {
  console.log('Joined project:', data.projectId);
});
```

#### 3. Agreement Signing
```typescript
// Client signs agreement
socket.emit('agreement:sign', {
  projectId: 'project123',
  userId: 'client456',
  userType: 'client',
  userName: 'John Doe',
  timestamp: new Date().toISOString()
});

// Listen for other party's signature
socket.on('agreement:signed', (data) => {
  console.log(`${data.signedBy.userName} signed the agreement`);
  // Update UI
});

// Listen for agreement completion
socket.on('agreement:complete', (data) => {
  console.log('Agreement fully signed!');
  // Redirect to payment page
});
```

#### 4. Real-time Messaging
```typescript
// Send message
socket.emit('message:send', {
  projectId: 'project123',
  messageId: 'msg789',
  senderId: 'user456',
  senderName: 'John Doe',
  senderType: 'client',
  content: 'Hello! How is the project going?',
  timestamp: new Date().toISOString(),
  type: 'text'
});

// Receive new messages
socket.on('message:new', (data) => {
  console.log('New message:', data.message);
  // Add to chat UI
});

// Typing indicator
socket.emit('message:typing-start', {
  projectId: 'project123',
  userId: 'user456',
  userName: 'John Doe'
});

socket.on('user:typing', (data) => {
  console.log(`${data.userName} is typing...`);
  // Show typing indicator
});

// Read receipts
socket.emit('message:read', {
  projectId: 'project123',
  userId: 'user456',
  messageIds: ['msg789', 'msg790']
});
```

#### 5. Project Status Updates
```typescript
// Listen for status changes
socket.on('project:status-updated', (data) => {
  console.log(`Status: ${data.oldStatus} → ${data.newStatus}`);
  // Update UI
});

// Listen for payment confirmations
socket.on('project:payment-confirmed', (data) => {
  console.log(`Payment secured: ${data.payment.amount} ${data.payment.currency}`);
  // Show success notification
});

// Listen for stage updates
socket.on('project:stage-updated', (data) => {
  console.log(`Stage ${data.stage.number}: ${data.stage.status}`);
  // Update progress bar
});
```

#### 6. React Component Example

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export default function ProjectChat({ projectId, userId, userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(null);

  useEffect(() => {
    const socket = getSocket();

    // Join project
    socket.emit('user:join', userId);
    socket.emit('project:join', { projectId, userId });

    // Listen for messages
    socket.on('message:new', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    // Listen for typing
    socket.on('user:typing', (data) => {
      setTyping(data.userName);
      setTimeout(() => setTyping(null), 3000);
    });

    // Listen for agreement updates
    socket.on('agreement:signed', (data) => {
      console.log('Agreement signed:', data);
    });

    return () => {
      socket.emit('project:leave', { projectId, userId });
    };
  }, [projectId, userId]);

  const sendMessage = () => {
    const socket = getSocket();
    socket.emit('message:send', {
      projectId,
      messageId: Date.now().toString(),
      senderId: userId,
      senderName: userName,
      content: input,
      timestamp: new Date().toISOString()
    });
    setInput('');
  };

  const handleTyping = () => {
    const socket = getSocket();
    socket.emit('message:typing-start', { projectId, userId, userName });
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id}>{msg.senderName}: {msg.content}</div>
        ))}
        {typing && <div>{typing} is typing...</div>}
      </div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleTyping}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

## 📋 Event Reference

### Connection Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `user:join` | Client → Server | `userId` | User connects to server |
| `user:connected` | Server → Client | `{userId, socketId}` | Connection confirmed |
| `disconnect` | Client → Server | - | User disconnects |

### Project Room Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `project:join` | Client → Server | `{projectId, userId}` | Join project room |
| `project:joined` | Server → Client | `{projectId}` | Room join confirmed |
| `project:leave` | Client → Server | `{projectId, userId}` | Leave project room |

### Agreement Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `agreement:sign` | Client → Server | `{projectId, userId, userType, userName, timestamp}` | User signs agreement |
| `agreement:signed` | Server → Client | `{projectId, signedBy, timestamp, message}` | Other party signed |
| `agreement:completed` | Client → Server | `{projectId, agreement}` | Both signed (backend trigger) |
| `agreement:complete` | Server → Client | `{projectId, agreement, timestamp, status}` | Agreement fully signed |
| `agreement:negotiate` | Client → Server | `{projectId, userId, changes, message}` | Request changes |
| `agreement:cancel` | Client → Server | `{projectId, userId, reason}` | Cancel agreement |

### Message Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `message:send` | Client → Server | `{projectId, messageId, senderId, content, ...}` | Send message |
| `message:new` | Server → Client | `{projectId, message}` | New message received |
| `message:typing-start` | Client → Server | `{projectId, userId, userName}` | User starts typing |
| `user:typing` | Server → Client | `{projectId, userId, userName}` | Someone is typing |
| `message:typing-stop` | Client → Server | `{projectId, userId}` | User stops typing |
| `user:stopped-typing` | Server → Client | `{projectId, userId}` | Someone stopped typing |
| `message:read` | Client → Server | `{projectId, userId, messageIds}` | Mark as read |
| `messages:read` | Server → Client | `{projectId, userId, messageIds, timestamp}` | Read receipt |

### Project Status Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `project:status-change` | Client → Server | `{projectId, oldStatus, newStatus, changedBy}` | Status changed |
| `project:status-updated` | Server → Client | `{projectId, oldStatus, newStatus, timestamp}` | Status update notification |
| `project:payment-secured` | Client → Server | `{projectId, amount, currency, paymentId}` | Payment made |
| `project:payment-confirmed` | Server → Client | `{projectId, payment, timestamp}` | Payment confirmation |
| `project:stage-update` | Client → Server | `{projectId, stageNumber, stageStatus, updatedBy}` | Stage progress |
| `project:stage-updated` | Server → Client | `{projectId, stage, timestamp}` | Stage update notification |
| `project:complete` | Client → Server | `{projectId, completedBy}` | Project completed |
| `project:completed` | Server → Client | `{projectId, completedBy, timestamp}` | Completion notification |

## 🏗️ Architecture

```
websocket-server/
├── src/
│   ├── server.js              # Main Socket.IO server
│   └── handlers/
│       ├── agreementHandlers.js   # Agreement signing logic
│       ├── messageHandlers.js     # Real-time messaging
│       └── projectHandlers.js     # Project status updates
├── package.json
├── .env.example
├── setup.sh
└── README.md
```

## 🔒 Security Considerations

1. **Authentication**: Integrate with your backend auth system
2. **Room Authorization**: Verify users belong to projects before joining rooms
3. **Rate Limiting**: Implement rate limits for message sending
4. **CORS**: Configure `ALLOWED_ORIGINS` properly
5. **Message Validation**: Validate all incoming event data

## 🚢 Deployment

### Environment Variables for Production

```bash
PORT=5000
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
NODE_ENV=production
```

### Recommended Platforms

- **Railway**: Easy deployment with WebSocket support
- **Render**: Built-in WebSocket support
- **AWS/GCP/Azure**: Using App Service or Container instances
- **DigitalOcean**: App Platform with WebSocket support

### Nginx Configuration (if using reverse proxy)

```nginx
location /socket.io/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 📊 Monitoring

Add logging for production:

```javascript
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);
  
  // Add error monitoring
  socket.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] Socket error:`, error);
    // Send to error tracking service (Sentry, etc.)
  });
});
```

## 🤝 Integration with Backend API

The WebSocket server complements the REST API:

- **REST API** (port 4000): CRUD operations, database updates
- **WebSocket** (port 5000): Real-time notifications and messaging

Workflow example:
1. Client signs agreement → REST API updates database
2. REST API triggers WebSocket event → Other party gets real-time notification
3. Both parties signed → WebSocket notifies both → REST API updates status

## 📝 License

MIT License

## 🆘 Support

For issues or questions:
- Check event reference above
- Review example implementations
- Test with Socket.IO client in browser console

---

**Status:** ✅ Production ready
**Port:** 5000 (default)
**Protocol:** WebSocket + HTTP polling fallback
