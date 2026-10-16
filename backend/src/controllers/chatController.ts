import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middlewares/auth';
import {
  Conversation,
  ConversationParticipant,
  Message,
  User,
  Attachment,
  MessageReceipt,
  MessageDeletion,
} from '../models';
import { getIO } from '../sockets/socketManager';

export class ChatController {
  /**
   * Get all conversations for current user with pagination, unread counts, and last message
   */
  static async getConversations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
      const offset = Math.max(Number(req.query.offset) || 0, 0);

      // Total count of conversations where current user is participant
      const totalCount = await ConversationParticipant.count({
        where: { userId },
      });

      // Find paginated conversation participant rows for current user
      // Ordered by isPinned DESC, then conversation's updatedAt DESC
      const participantRows = await ConversationParticipant.findAll({
        where: { userId },
        include: [
          {
            model: Conversation,
            as: 'conversation',
            attributes: ['id', 'updatedAt'],
            required: true,
          },
        ],
        order: [
          ['isPinned', 'DESC'],
          [{ model: Conversation, as: 'conversation' }, 'updatedAt', 'DESC'],
        ],
        limit,
        offset,
      });

      const conversationIds = participantRows
        .map((p) => p.conversationId || (p as any).conversation_id || (p as any).dataValues?.conversationId || (p as any).dataValues?.conversation_id)
        .filter((id): id is string => typeof id === 'string' && id.trim().length > 0);

      if (conversationIds.length === 0) {
        return res.json({
          success: true,
          data: {
            conversations: [],
            hasMore: false,
            totalCount,
          },
        });
      }

      // Fetch messages deleted by this user (Delete for me)
      const userDeletions = await MessageDeletion.findAll({
        where: { userId },
        attributes: ['messageId'],
      });
      const deletedMessageIds = userDeletions.map((d) => d.messageId);

      // Fetch the full conversations for this page with participants and latest message
      const conversations = await Conversation.findAll({
        where: { id: { [Op.in]: conversationIds } },
        include: [
          {
            model: User,
            as: 'participants',
            attributes: ['id', 'username', 'email', 'avatarUrl', 'about', 'isOnline', 'lastSeen'],
            through: { attributes: ['role', 'isPinned', 'isMuted', 'joinedAt'] },
          },
          {
            model: Message,
            as: 'messages',
            separate: true,
            where: deletedMessageIds.length > 0 ? { id: { [Op.notIn]: deletedMessageIds } } : undefined,
            limit: 1,
            order: [['createdAt', 'DESC']],
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'username'],
              },
            ],
          },
        ],
      });

      const convMap = new Map<string, Conversation>();
      conversations.forEach((c) => {
        convMap.set(c.id, c);
      });

      // Enrich only the paginated conversations
      const enrichedConversations = await Promise.all(
        participantRows.map(async (pRow) => {
          const convId = pRow.conversationId || (pRow as any).conversation_id;
          const conv = convMap.get(convId);
          if (!conv) return null;

          const unreadCount = await Message.count({
            where: {
              conversationId: conv.id,
              senderId: { [Op.ne]: userId },
              status: { [Op.ne]: 'read' },
            },
          });

          const plain = conv.toJSON() as any;
          plain.unreadCount = unreadCount;
          plain.isPinned = pRow.isPinned || false;
          plain.isMuted = pRow.isMuted || false;

          if (plain.messages && plain.messages.length > 0) {
            const rawLast = plain.messages[0];
            if (rawLast.isDeletedEveryone) {
              rawLast.content = 'This message was deleted';
              rawLast.attachments = [];
            }
            plain.lastMessage = rawLast;
          } else {
            plain.lastMessage = null;
          }

          delete plain.messages;
          return plain;
        })
      );

      const validConversations = enrichedConversations.filter(Boolean);
      const hasMore = offset + participantRows.length < totalCount;

      return res.json({
        success: true,
        data: {
          conversations: validConversations,
          hasMore,
          totalCount,
        },
      });
    } catch (err: any) {
      console.error('[ChatController.getConversations]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Start 1-on-1 or Group Conversation
   */
  static async createConversation(req: AuthRequest, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { isGroup, recipientId, memberIds, title } = req.body;

      if (!isGroup) {
        if (!recipientId) {
          return res.status(400).json({ success: false, message: 'Recipient user ID is required.' });
        }

        // Check if 1-on-1 conversation already exists between current user & recipient
        const myConversations = await ConversationParticipant.findAll({
          where: { userId: currentUserId },
          attributes: ['conversationId'],
        });

        const myConvIds = myConversations
          .map((c) => c.conversationId || (c as any).conversation_id || (c as any).dataValues?.conversationId || (c as any).dataValues?.conversation_id)
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0);

        if (myConvIds.length > 0) {
          const sharedParticipants = await ConversationParticipant.findAll({
            where: {
              conversationId: { [Op.in]: myConvIds },
              userId: recipientId,
            },
            attributes: ['conversationId'],
          });

          if (sharedParticipants.length > 0) {
            // Check if any of these shared is 1-on-1
            for (const sp of sharedParticipants) {
              const sharedConvId = sp.conversationId || (sp as any).conversation_id || (sp as any).dataValues?.conversationId;
              if (!sharedConvId) continue;

              const existingConv = await Conversation.findOne({
                where: { id: sharedConvId, isGroup: false },
                include: [
                  {
                    model: User,
                    as: 'participants',
                    attributes: ['id', 'username', 'email', 'avatarUrl', 'about', 'isOnline', 'lastSeen'],
                  },
                ],
              });

              if (existingConv) {
                return res.json({ success: true, data: { conversation: existingConv, isExisting: true } });
              }
            }
          }
        }

        // Create new 1-on-1 conversation
        const newConv = await Conversation.create({
          isGroup: false,
          createdById: currentUserId,
        });

        await ConversationParticipant.bulkCreate([
          { conversationId: newConv.id, userId: currentUserId, role: 'admin' },
          { conversationId: newConv.id, userId: recipientId, role: 'member' },
        ]);

        const fullConv = await Conversation.findByPk(newConv.id, {
          include: [
            {
              model: User,
              as: 'participants',
              attributes: ['id', 'username', 'email', 'avatarUrl', 'about', 'isOnline', 'lastSeen'],
            },
          ],
        });

        return res.status(201).json({ success: true, data: { conversation: fullConv, isExisting: false } });
      } else {
        // Create Group Conversation
        if (!title || !title.trim()) {
          return res.status(400).json({ success: false, message: 'Group title is required.' });
        }

        const members = Array.isArray(memberIds) ? memberIds : [];
        if (!members.includes(currentUserId)) {
          members.push(currentUserId);
        }

        const newGroup = await Conversation.create({
          isGroup: true,
          title: title.trim(),
          createdById: currentUserId,
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}`,
        });

        const participantRecords = members.map((uid: string) => ({
          conversationId: newGroup.id,
          userId: uid,
          role: (uid === currentUserId ? 'admin' : 'member') as 'admin' | 'member',
        }));

        await ConversationParticipant.bulkCreate(participantRecords);

        const fullGroup = await Conversation.findByPk(newGroup.id, {
          include: [
            {
              model: User,
              as: 'participants',
              attributes: ['id', 'username', 'email', 'avatarUrl', 'about', 'isOnline', 'lastSeen'],
            },
          ],
        });

        return res.status(201).json({ success: true, data: { conversation: fullGroup, isExisting: false } });
      }
    } catch (err: any) {
      console.error('[ChatController.createConversation]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Get Message History for a Conversation (supports cursor-based pagination and offset)
   */
  static async getMessages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { conversationId } = req.params;
      const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
      const offset = req.query.offset !== undefined ? Number(req.query.offset) : undefined;
      const before = req.query.before as string | undefined;
      const beforeMessageId = req.query.beforeMessageId as string | undefined;

      if (!conversationId || conversationId === 'undefined') {
        return res.status(400).json({ success: false, message: 'Valid conversation ID is required.' });
      }

      // Ensure user is participant
      const isParticipant = await ConversationParticipant.findOne({
        where: { conversationId, userId },
      });

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'You are not a participant in this conversation.' });
      }

      // Exclude messages deleted by current user (Delete for me)
      const userDeletions = await MessageDeletion.findAll({
        where: { userId },
        attributes: ['messageId'],
      });
      const deletedMessageIds = userDeletions.map((d) => d.messageId);

      const whereClause: any = { conversationId };

      if (deletedMessageIds.length > 0) {
        whereClause.id = { [Op.notIn]: deletedMessageIds };
      }

      if (before) {
        const beforeDate = new Date(before);
        if (!isNaN(beforeDate.getTime())) {
          whereClause.createdAt = { [Op.lt]: beforeDate };
        }
      } else if (beforeMessageId) {
        const refMessage = await Message.findByPk(beforeMessageId);
        if (refMessage && refMessage.createdAt) {
          whereClause.createdAt = { [Op.lt]: refMessage.createdAt };
        }
      }

      const queryOptions: any = {
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatarUrl'],
          },
          {
            model: Message,
            as: 'replyTo',
            attributes: ['id', 'content', 'senderId', 'messageType'],
            include: [{ model: User, as: 'sender', attributes: ['username'] }],
          },
          {
            model: Attachment,
            as: 'attachments',
          },
        ],
      };

      if (offset !== undefined && !isNaN(offset) && !before && !beforeMessageId) {
        queryOptions.offset = offset;
      }

      const rawMessages = await Message.findAll(queryOptions);

      // Sort chronological (oldest to newest for chat flow)
      const messages = [...rawMessages].reverse();

      // Total count of all messages in this conversation
      const totalCount = await Message.count({ where: { conversationId } });

      // Determine if there are more older messages prior to the oldest one returned
      let hasMore = false;
      if (messages.length > 0) {
        const oldestCreatedAt = messages[0].createdAt;
        const olderCount = await Message.count({
          where: {
            conversationId,
            createdAt: { [Op.lt]: oldestCreatedAt },
          },
        });
        hasMore = olderCount > 0;
      }

      return res.json({
        success: true,
        data: {
          messages,
          hasMore,
          totalCount,
        },
      });
    } catch (err: any) {
      console.error('[ChatController.getMessages]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Send Message via REST
   */
  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const senderId = req.user?.userId;
      if (!senderId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { conversationId, content, messageType, replyToId, attachments } = req.body;

      if (!conversationId || conversationId === 'undefined') {
        return res.status(400).json({ success: false, message: 'Valid conversation ID is required.' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
      }

      if (content.trim().length > 500) {
        return res.status(400).json({ success: false, message: 'Message cannot exceed 500 characters.' });
      }

      // Verify participation
      const isParticipant = await ConversationParticipant.findOne({
        where: { conversationId, userId: senderId },
      });

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Not a member of this chat.' });
      }

      const message = await Message.create({
        conversationId,
        senderId,
        content: content.trim(),
        messageType: messageType || 'text',
        replyToId: replyToId || null,
        status: 'sent',
      });

      // Handle attachments if any
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        const attachmentRecords = attachments.map((att: any) => ({
          messageId: message.id,
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSize: att.fileSize,
        }));
        await Attachment.bulkCreate(attachmentRecords);
      }

      // Touch conversation updated_at
      await Conversation.update({ updatedAt: new Date() }, { where: { id: conversationId } });

      const fullMessage = await Message.findByPk(message.id, {
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

      return res.status(201).json({ success: true, data: { message: fullMessage } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Mark Messages as Read
   */
  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { conversationId } = req.params;

      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      if (!conversationId || conversationId === 'undefined') {
        return res.status(400).json({ success: false, message: 'Valid conversation ID is required.' });
      }

      // Update message status where sender is not current user
      await Message.update(
        { status: 'read' },
        {
          where: {
            conversationId,
            senderId: { [Op.ne]: userId },
            status: { [Op.ne]: 'read' },
          },
        }
      );

      return res.json({ success: true, message: 'Messages marked as read.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Delete Message (Delete for Everyone or Delete for Me)
   */
  static async deleteMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { messageId } = req.params;
      const { type } = req.body; // 'everyone' | 'for_me'

      if (!messageId) {
        return res.status(400).json({ success: false, message: 'Message ID is required.' });
      }

      if (type !== 'everyone' && type !== 'for_me') {
        return res.status(400).json({ success: false, message: "Delete type must be 'everyone' or 'for_me'." });
      }

      const message = await Message.findByPk(messageId);
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found.' });
      }

      // Check user is participant in this conversation
      const participant = await ConversationParticipant.findOne({
        where: { conversationId: message.conversationId, userId },
      });

      if (!participant) {
        return res.status(403).json({ success: false, message: 'You are not a participant in this conversation.' });
      }

      if (type === 'everyone') {
        // Only sender or group admin can delete for everyone
        const isSender = message.senderId === userId;
        const isAdmin = participant.role === 'admin';

        if (!isSender && !isAdmin) {
          return res.status(403).json({
            success: false,
            message: 'You can only delete your own messages for everyone.',
          });
        }

        // Soft delete for everyone
        message.isDeletedEveryone = true;
        message.content = 'This message was deleted';
        await message.save();

        // Remove attachments associated with this message
        await Attachment.destroy({ where: { messageId: message.id } });

        // Broadcast to conversation room via Socket.IO
        const io = getIO();
        if (io) {
          io.to(`conversation:${message.conversationId}`).emit('message_deleted', {
            messageId: message.id,
            conversationId: message.conversationId,
            isDeletedEveryone: true,
          });

          // Also notify participants in their user rooms so sidebar last message updates
          const convParticipants = await ConversationParticipant.findAll({
            where: { conversationId: message.conversationId },
            attributes: ['userId'],
          });
          convParticipants.forEach((p) => {
            io.to(`user:${p.userId}`).emit('conversation_updated', {
              conversationId: message.conversationId,
            });
          });
        }

        return res.json({
          success: true,
          message: 'Message deleted for everyone.',
          data: {
            messageId: message.id,
            conversationId: message.conversationId,
            isDeletedEveryone: true,
          },
        });
      } else {
        // 'for_me': Record deletion for current user only
        await MessageDeletion.findOrCreate({
          where: { messageId: message.id, userId },
          defaults: { messageId: message.id, userId },
        });

        // Notify user's own socket room to update conversation lastMessage
        const io = getIO();
        if (io) {
          io.to(`user:${userId}`).emit('conversation_updated', {
            conversationId: message.conversationId,
          });
        }

        return res.json({
          success: true,
          message: 'Message deleted for you.',
          data: {
            messageId: message.id,
            conversationId: message.conversationId,
            isDeletedForMe: true,
          },
        });
      }
    } catch (err: any) {
      console.error('[ChatController.deleteMessage]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
