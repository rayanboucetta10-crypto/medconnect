const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Map userId → socketId for video call routing
const userSocketMap = new Map();

const initSocket = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie
      ?.split(';')
      .find((c) => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
      } catch {
        // allow anonymous (browse-only) connections
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      userSocketMap.set(socket.userId, socket.id);
      // Broadcast online status
      socket.broadcast.emit('user_online', { userId: socket.userId });
    }

    // ── Join conversation room ──────────────────────────────────────
    socket.on('join_room', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('leave_room', (conversationId) => {
      socket.leave(conversationId);
    });

    // ── Messaging ───────────────────────────────────────────────────
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, fileUrl, fileType, fileName } = data;
        if (!socket.userId) return;

        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          content: content || '',
          fileUrl: fileUrl || '',
          fileType: fileType || '',
          fileName: fileName || '',
          readBy: [socket.userId],
          status: 'sent',
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        const populated = await Message.findById(message._id)
          .populate('senderId', 'name profilePhoto role');

        // Emit to everyone in the room
        io.to(conversationId).emit('receive_message', populated);

        // Send notification to offline participants
        const conv = await Conversation.findById(conversationId);
        if (conv) {
          conv.participants.forEach((participantId) => {
            const pid = participantId.toString();
            if (pid !== socket.userId) {
              const recipientSocketId = userSocketMap.get(pid);
              if (recipientSocketId) {
                io.to(recipientSocketId).emit('notification', {
                  type: 'new_message',
                  conversationId,
                  message: populated,
                });
                // Update message status to delivered
                Message.findByIdAndUpdate(message._id, { status: 'delivered' });
                io.to(conversationId).emit('message_status', {
                  messageId: message._id,
                  status: 'delivered',
                });
              }
            }
          });
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Typing indicators ───────────────────────────────────────────
    socket.on('typing_start', ({ conversationId, userName }) => {
      socket.to(conversationId).emit('user_typing', {
        userId: socket.userId,
        userName,
        conversationId,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(conversationId).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    // ── Mark messages read ──────────────────────────────────────────
    socket.on('mark_read', async ({ conversationId }) => {
      if (!socket.userId) return;
      await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: socket.userId },
          readBy: { $not: { $elemMatch: { $eq: socket.userId } } },
        },
        { $addToSet: { readBy: socket.userId }, $set: { status: 'read' } }
      );
      socket.to(conversationId).emit('messages_read', {
        conversationId,
        readBy: socket.userId,
      });
    });

    // ── WebRTC / Video Call ─────────────────────────────────────────
    socket.on('call_user', ({ to, from, signal, callerName }) => {
      const recipientSocketId = userSocketMap.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('incoming_call', {
          from,
          signal,
          callerName,
          callerSocketId: socket.id,
        });
      } else {
        socket.emit('call_rejected', { reason: 'User is offline' });
      }
    });

    socket.on('accept_call', ({ to, signal }) => {
      const callerSocketId = userSocketMap.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call_accepted', { signal });
      }
    });

    socket.on('reject_call', ({ to }) => {
      const callerSocketId = userSocketMap.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call_rejected', { reason: 'Call declined' });
      }
    });

    socket.on('end_call', ({ to }) => {
      const recipientSocketId = userSocketMap.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call_ended');
      }
    });

    socket.on('ice_candidate', ({ to, candidate }) => {
      const recipientSocketId = userSocketMap.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('ice_candidate', { candidate });
      }
    });

    // ── Disconnect ──────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSocketMap.delete(socket.userId);
        socket.broadcast.emit('user_offline', { userId: socket.userId });
      }
    });
  });
};

module.exports = initSocket;
