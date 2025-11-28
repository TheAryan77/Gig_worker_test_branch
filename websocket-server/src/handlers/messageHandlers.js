export function registerMessageHandlers(socket, io, typingUsers) {
  
  socket.on('message:send', (data) => {
    const { 
      projectId, 
      messageId,
      senderId, 
      senderName, 
      senderType,
      content, 
      timestamp,
      type = 'text',
      fileUrl,
      fileName
    } = data;

    if (!projectId || !senderId || !content) {
      socket.emit('error', { message: 'Project ID, Sender ID, and Content are required' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`💬 Message from ${senderId} in project ${projectId}`);

    const projectTypingUsers = typingUsers.get(projectId);
    if (projectTypingUsers && projectTypingUsers.has(senderId)) {
      projectTypingUsers.delete(senderId);
      io.to(roomName).emit('user:stopped-typing', {
        projectId,
        userId: senderId
      });
    }

    io.to(roomName).emit('message:new', {
      projectId,
      message: {
        id: messageId,
        senderId,
        senderName,
        senderType,
        content,
        type,
        fileUrl,
        fileName,
        timestamp: timestamp || new Date().toISOString(),
        status: 'sent'
      }
    });

    socket.emit('message:delivered', {
      projectId,
      messageId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('message:typing-start', (data) => {
    const { projectId, userId, userName } = data;

    if (!projectId || !userId) {
      return;
    }

    if (!typingUsers.has(projectId)) {
      typingUsers.set(projectId, new Set());
    }
    typingUsers.get(projectId).add(userId);

    const roomName = `project:${projectId}`;
    
    socket.to(roomName).emit('user:typing', {
      projectId,
      userId,
      userName
    });
  });

  socket.on('message:typing-stop', (data) => {
    const { projectId, userId } = data;

    if (!projectId || !userId) {
      return;
    }

    const projectTypingUsers = typingUsers.get(projectId);
    if (projectTypingUsers) {
      projectTypingUsers.delete(userId);
    }

    const roomName = `project:${projectId}`;
    
    socket.to(roomName).emit('user:stopped-typing', {
      projectId,
      userId
    });
  });

  socket.on('message:read', (data) => {
    const { projectId, userId, messageIds } = data;

    if (!projectId || !userId || !messageIds || messageIds.length === 0) {
      return;
    }

    const roomName = `project:${projectId}`;
    
    socket.to(roomName).emit('messages:read', {
      projectId,
      userId,
      messageIds,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('message:delete', (data) => {
    const { projectId, messageId, userId } = data;

    if (!projectId || !messageId || !userId) {
      socket.emit('error', { message: 'Invalid delete request' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`🗑️  Message ${messageId} deleted in project ${projectId}`);

    io.to(roomName).emit('message:deleted', {
      projectId,
      messageId,
      deletedBy: userId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('message:edit', (data) => {
    const { projectId, messageId, userId, newContent } = data;

    if (!projectId || !messageId || !userId || !newContent) {
      socket.emit('error', { message: 'Invalid edit request' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`✏️  Message ${messageId} edited in project ${projectId}`);

    io.to(roomName).emit('message:edited', {
      projectId,
      messageId,
      editedBy: userId,
      newContent,
      editedAt: new Date().toISOString()
    });
  });

  socket.on('message:file-upload', (data) => {
    const { projectId, userId, userName, fileName, fileSize, fileType } = data;

    if (!projectId || !userId) {
      return;
    }

    const roomName = `project:${projectId}`;
    
    socket.to(roomName).emit('message:file-uploading', {
      projectId,
      userId,
      userName,
      fileName,
      fileSize,
      fileType,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('messages:mark-all-read', (data) => {
    const { projectId, userId } = data;

    if (!projectId || !userId) {
      return;
    }

    const roomName = `project:${projectId}`;
    
    socket.to(roomName).emit('messages:all-read', {
      projectId,
      userId,
      timestamp: new Date().toISOString()
    });
  });
}
