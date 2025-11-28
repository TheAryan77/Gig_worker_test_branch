export function registerProjectHandlers(socket, io) {
  
  socket.on('project:status-change', (data) => {
    const { projectId, oldStatus, newStatus, changedBy, reason } = data;

    if (!projectId || !newStatus) {
      socket.emit('error', { message: 'Project ID and new status are required' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`📊 Project ${projectId} status: ${oldStatus} → ${newStatus}`);

    io.to(roomName).emit('project:status-updated', {
      projectId,
      oldStatus,
      newStatus,
      changedBy,
      reason,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('project:payment-secured', (data) => {
    const { projectId, amount, currency, paymentId } = data;

    if (!projectId || !amount) {
      socket.emit('error', { message: 'Project ID and amount are required' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`💰 Payment secured for project ${projectId}: ${currency} ${amount}`);

    io.to(roomName).emit('project:payment-confirmed', {
      projectId,
      payment: {
        amount,
        currency,
        paymentId,
        status: 'secured'
      },
      timestamp: new Date().toISOString(),
      message: 'Payment has been secured in escrow'
    });
  });

  socket.on('project:stage-update', (data) => {
    const { projectId, stageNumber, stageStatus, updatedBy, description } = data;

    if (!projectId || stageNumber === undefined || !stageStatus) {
      socket.emit('error', { message: 'Invalid stage update data' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`📈 Stage ${stageNumber} of project ${projectId}: ${stageStatus}`);

    io.to(roomName).emit('project:stage-updated', {
      projectId,
      stage: {
        number: stageNumber,
        status: stageStatus,
        description,
        updatedBy
      },
      timestamp: new Date().toISOString()
    });
  });

  socket.on('project:payment-released', (data) => {
    const { projectId, amount, currency, recipientId } = data;

    if (!projectId || !amount || !recipientId) {
      socket.emit('error', { message: 'Invalid payment release data' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`💸 Payment released for project ${projectId}`);

    io.to(roomName).emit('project:payment-released-notification', {
      projectId,
      payment: {
        amount,
        currency,
        recipientId,
        status: 'released'
      },
      timestamp: new Date().toISOString(),
      message: 'Payment has been released from escrow'
    });
  });

  socket.on('project:complete', (data) => {
    const { projectId, completedBy } = data;

    if (!projectId) {
      socket.emit('error', { message: 'Project ID is required' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`✅ Project ${projectId} completed`);

    io.to(roomName).emit('project:completed', {
      projectId,
      completedBy,
      timestamp: new Date().toISOString(),
      message: 'Project has been marked as completed'
    });
  });

  socket.on('project:rating-submitted', (data) => {
    const { projectId, raterId, raterType, rating, review } = data;

    if (!projectId || !raterId || rating === undefined) {
      socket.emit('error', { message: 'Invalid rating data' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`⭐ Rating submitted for project ${projectId}: ${rating}/5`);

    io.to(roomName).emit('project:rating-received', {
      projectId,
      rating: {
        raterId,
        raterType,
        rating,
        review
      },
      timestamp: new Date().toISOString()
    });
  });

  socket.on('project:dispute', (data) => {
    const { projectId, raisedBy, reason, description } = data;

    if (!projectId || !raisedBy || !reason) {
      socket.emit('error', { message: 'Invalid dispute data' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`⚠️  Dispute raised for project ${projectId}`);

    io.to(roomName).emit('project:dispute-raised', {
      projectId,
      dispute: {
        raisedBy,
        reason,
        description,
        status: 'pending'
      },
      timestamp: new Date().toISOString(),
      message: 'A dispute has been raised for this project'
    });
  });

  socket.on('project:cancel', (data) => {
    const { projectId, cancelledBy, reason } = data;

    if (!projectId || !cancelledBy) {
      socket.emit('error', { message: 'Project ID and canceller are required' });
      return;
    }

    const roomName = `project:${projectId}`;
    
    console.log(`🚫 Project ${projectId} cancelled`);

    io.to(roomName).emit('project:cancelled', {
      projectId,
      cancelledBy,
      reason,
      timestamp: new Date().toISOString(),
      message: 'Project has been cancelled'
    });
  });

  socket.on('project:deadline-reminder', (data) => {
    const { projectId, deadline, hoursRemaining } = data;

    if (!projectId || !deadline) {
      return;
    }

    const roomName = `project:${projectId}`;
    
    io.to(roomName).emit('project:deadline-alert', {
      projectId,
      deadline,
      hoursRemaining,
      timestamp: new Date().toISOString(),
      message: `Deadline approaching: ${hoursRemaining} hours remaining`
    });
  });

  socket.on('project:notification', (data) => {
    const { projectId, type, title, message, data: additionalData } = data;

    if (!projectId || !type || !message) {
      return;
    }

    const roomName = `project:${projectId}`;
    
    io.to(roomName).emit('project:notify', {
      projectId,
      notification: {
        type,
        title,
        message,
        data: additionalData
      },
      timestamp: new Date().toISOString()
    });
  });
}
