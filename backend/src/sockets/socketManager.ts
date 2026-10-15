import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken, TokenPayload } from '../utils/token';
import { RedisService } from '../services/redisService';
import { Message, User, Conversation, Attachment, ConversationParticipant } from '../models';

export interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Socket JWT Authentication Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const rawToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!rawToken || typeof rawToken !== 'string' || rawToken === 'undefined' || rawToken === 'null' || !rawToken.trim()) {
      return next(new Error('Authentication error: Token required'));
    }

    const decoded = verifyToken(rawToken);
    if (!decoded || !decoded.userId) {
      return next(new Error('Authentication error: Invalid token'));
    }

    socket.user = decoded;
    next();
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const user = socket.user;
    const userId = user?.userId;

    if (!user || !userId) {
      console.warn(`[Socket] Rejected unauthenticated connection: ${socket.id}`);
      socket.disconnect(true);
      return;
    }

    console.log(`[Socket] User connected: ${user.username} (${userId}) - Socket: ${socket.id}`);

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // Track online presence
    try {
      await RedisService.addUserSocket(userId, socket.id);
      await User.update({ isOnline: true, lastSeen: new Date() }, { where: { id: userId } });
    } catch (err: any) {
      console.error('[Socket] Failed to update user presence in DB:', err.message);
    }

    // Broadcast online status to all connected users
    io.emit('user_presence', {
      userId,
      isOnline: true,
      lastSeen: new Date(),
    });

    /**
     * Join conversation room
     */
    socket.on('join_conversation', (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.join(`conversation:${data.conversationId}`);
        console.log(`[Socket] User ${user.username} joined room conversation:${data.conversationId}`);
      }
    });

    /**
     * Leave conversation room
     */
    socket.on('leave_conversation', (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.leave(`conversation:${data.conversationId}`);
      }
    });

    /**
     * Send Real-Time Message
     */
    socket.on('send_message', async (data: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'image' | 'video' | 'audio' | 'document';
      replyToId?: string;
      attachments?: Array<{
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
      }>;
    }) => {
      try {
        const { conversationId, content, messageType = 'text', replyToId, attachments } = data;

        if (!conversationId || !content?.trim()) {
          socket.emit('error', { message: 'Conversation ID and content required' });
          return;
        }

        // Verify participation
        const isParticipant = await ConversationParticipant.findOne({
          where: { conversationId, userId },
        });

        if (!isParticipant) {
          socket.emit('error', { message: 'You are not a participant in this conversation' });
          return;
        }

        // Save message to MySQL
        const message = await Message.create({
          conversationId,
          senderId: userId,
          content: content.trim(),
          messageType,
          replyToId: replyToId || null,
          status: 'sent',
        });

        if (attachments && attachments.length > 0) {
          await Attachment.bulkCreate(
            attachments.map((att) => ({
              messageId: message.id,
              fileName: att.fileName,
              fileUrl: att.fileUrl,
              fileType: att.fileType,
              fileSize: att.fileSize,
            }))
          );
        }

        // Update conversation updated_at
        await Conversation.update({ updatedAt: new Date() }, { where: { id: conversationId } });

        // Retrieve full populated message
        const populatedMessage = await Message.findByPk(message.id, {
          include: [
            { model: User, as: 'sender', attributes: ['id', 'username', 'avatarUrl'] },
            { model: Attachment, as: 'attachments' },
            {
              model: Message,
              as: 'replyTo',
              include: [{ model: User, as: 'sender', attributes: ['username'] }],
            },
          ],
        });

        // Broadcast to conversation room (including sender)
        io.to(`conversation:${conversationId}`).emit('new_message', populatedMessage);

        // Also notify participants who might not be actively looking at the room
        const participants = await ConversationParticipant.findAll({
          where: { conversationId },
          attributes: ['userId'],
        });

        participants.forEach((p) => {
          if (p.userId !== userId) {
            io.to(`user:${p.userId}`).emit('conversation_updated', {
              conversationId,
              lastMessage: populatedMessage,
            });
          }
        });
      } catch (err: any) {
        console.error('[Socket.send_message]', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Typing Start
     */
    socket.on('typing_start', async (data: { conversationId: string }) => {
      if (!data?.conversationId) return;
      await RedisService.setTyping(data.conversationId, userId);
      socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
        conversationId: data.conversationId,
        userId,
        username: user.username,
        isTyping: true,
      });
    });

    /**
     * Typing Stop
     */
    socket.on('typing_stop', async (data: { conversationId: string }) => {
      if (!data?.conversationId) return;
      await RedisService.clearTyping(data.conversationId, userId);
      socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
        conversationId: data.conversationId,
        userId,
        username: user.username,
        isTyping: false,
      });
    });

    /**
     * Message Read Update (Double Blue Tick)
     */
    socket.on('mark_read', async (data: { conversationId: string }) => {
      try {
        if (!data?.conversationId) return;

        await Message.update(
          { status: 'read' },
          {
            where: {
              conversationId: data.conversationId,
              status: 'sent',
            },
          }
        );

        io.to(`conversation:${data.conversationId}`).emit('messages_read', {
          conversationId: data.conversationId,
          readByUserId: userId,
        });
      } catch (err) {
        console.error('[Socket.mark_read]', err);
      }
    });

    /**
     * Handle Disconnect
     */
    socket.on('disconnect', async () => {
      const isCompletelyOffline = await RedisService.removeUserSocket(userId, socket.id);
      console.log(`[Socket] User disconnected: ${user.username} (Offline: ${isCompletelyOffline})`);

      if (isCompletelyOffline) {
        const lastSeen = new Date();
        await User.update({ isOnline: false, lastSeen }, { where: { id: userId } });

        io.emit('user_presence', {
          userId,
          isOnline: false,
          lastSeen,
        });
      }
    });
  });
};
