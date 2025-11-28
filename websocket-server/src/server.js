import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

const io = new Server(PORT, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const connectedUsers = new Map();
const userSockets = new Map();
const typingUsers = new Map();

console.log(`🚀 WebSocket server starting on port ${PORT}...`);

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on('user:join', (userId) => {
    if (!userId) {
      socket.emit('error', { message: 'User ID is required' });
      return;
    }

    connectedUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);

    console.log(`👤 User ${userId} joined (socket: ${socket.id})`);
    
    socket.emit('user:connected', { userId, socketId: socket.id });
  });

  socket.on('user:online', ({ userId, projectIds = [] }) => {
    projectIds.forEach(projectId => {
      socket.to(`project:${projectId}`).emit('user:status', {
        userId,
        status: 'online',
        timestamp: new Date().toISOString()
      });
    });
  });

  socket.on('user:offline', ({ userId, projectIds = [] }) => {
    projectIds.forEach(projectId => {
      socket.to(`project:${projectId}`).emit('user:status', {
        userId,
        status: 'offline',
        timestamp: new Date().toISOString()
      });
    });
  });

  socket.on('project:join', ({ projectId, userId }) => {
    if (!projectId || !userId) {
      socket.emit('error', { message: 'Project ID and User ID are required' });
      return;
    }

    const roomName = `project:${projectId}`;
    socket.join(roomName);
    
    console.log(`📁 User ${userId} joined project room: ${projectId}`);
    
    socket.to(roomName).emit('user:joined-project', {
      projectId,
      userId,
      timestamp: new Date().toISOString()
    });

    socket.emit('project:joined', { projectId });
  });

  socket.on('project:leave', ({ projectId, userId }) => {
    const roomName = `project:${projectId}`;
    socket.leave(roomName);
    
    console.log(`📁 User ${userId} left project room: ${projectId}`);
    
    socket.to(roomName).emit('user:left-project', {
      projectId,
      userId,
      timestamp: new Date().toISOString()
    });
  });

  import('./handlers/agreementHandlers.js').then(module => {
    module.registerAgreementHandlers(socket, io);
  });

  import('./handlers/messageHandlers.js').then(module => {
    module.registerMessageHandlers(socket, io, typingUsers);
  });

  import('./handlers/projectHandlers.js').then(module => {
    module.registerProjectHandlers(socket, io);
  });

  socket.on('disconnect', () => {
    const userId = userSockets.get(socket.id);
    
    if (userId) {
      connectedUsers.delete(userId);
      userSockets.delete(socket.id);
      
      typingUsers.forEach((users, projectId) => {
        if (users.has(userId)) {
          users.delete(userId);
          io.to(`project:${projectId}`).emit('user:stopped-typing', {
            projectId,
            userId
          });
        }
      });
      
      console.log(`❌ User ${userId} disconnected (socket: ${socket.id})`);
    } else {
      console.log(`❌ Client disconnected: ${socket.id}`);
    }
  });

  socket.on('error', (error) => {
    console.error(`⚠️  Socket error:`, error);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  io.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  io.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

console.log(`✨ WebSocket server running on port ${PORT}`);
console.log(`🌐 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
