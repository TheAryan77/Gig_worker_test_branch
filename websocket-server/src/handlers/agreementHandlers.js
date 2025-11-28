export function registerAgreementHandlers(socket, io) {
  
  socket.on('agreement:sign', (data) => {
    const { projectId, userId, userType, userName, timestamp } = data;

    if (!projectId || !userId || !userType) {
      socket.emit('error', { 
        message: 'Project ID, User ID, and User Type are required for signing' 
      });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`📝 ${userType} ${userId} signed agreement for project ${projectId}`);

    socket.to(roomName).emit('agreement:signed', {
      projectId,
      signedBy: {
        userId,
        userType,
        userName
      },
      timestamp: timestamp || new Date().toISOString(),
      message: `${userName} has signed the agreement`
    });

    socket.emit('agreement:sign-confirmed', {
      projectId,
      userId,
      userType,
      timestamp: timestamp || new Date().toISOString()
    });
  });

  socket.on('agreement:completed', (data) => {
    const { projectId, agreement } = data;

    if (!projectId) {
      socket.emit('error', { message: 'Project ID is required' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`✅ Agreement completed for project ${projectId}`);

    io.to(roomName).emit('agreement:complete', {
      projectId,
      agreement,
      timestamp: new Date().toISOString(),
      message: 'Agreement has been signed by both parties',
      status: 'completed'
    });
  });

  socket.on('agreement:view', (data) => {
    const { projectId, userId, userName } = data;

    if (!projectId || !userId) {
      return;
    }

    const roomName = `project:${projectId}`;
    
    socket.to(roomName).emit('agreement:viewing', {
      projectId,
      viewer: {
        userId,
        userName
      },
      timestamp: new Date().toISOString()
    });
  });

  socket.on('agreement:negotiate', (data) => {
    const { projectId, userId, userName, changes, message } = data;

    if (!projectId || !userId) {
      socket.emit('error', { message: 'Project ID and User ID are required' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`🔄 Negotiation requested for project ${projectId} by ${userId}`);

    socket.to(roomName).emit('agreement:negotiation-request', {
      projectId,
      requestedBy: {
        userId,
        userName
      },
      changes,
      message,
      timestamp: new Date().toISOString()
    });

    socket.emit('agreement:negotiation-sent', {
      projectId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('agreement:negotiation-response', (data) => {
    const { projectId, userId, userName, response, message } = data;

    if (!projectId || !userId || !response) {
      socket.emit('error', { message: 'Invalid negotiation response data' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`${response === 'accepted' ? '✅' : '❌'} Negotiation ${response} for project ${projectId}`);

    io.to(roomName).emit('agreement:negotiation-responded', {
      projectId,
      respondedBy: {
        userId,
        userName
      },
      response,
      message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('agreement:cancel', (data) => {
    const { projectId, userId, userName, reason } = data;

    if (!projectId || !userId) {
      socket.emit('error', { message: 'Project ID and User ID are required' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`🚫 Agreement cancelled for project ${projectId} by ${userId}`);

    io.to(roomName).emit('agreement:cancelled', {
      projectId,
      cancelledBy: {
        userId,
        userName
      },
      reason,
      timestamp: new Date().toISOString()
    });
  });
}
