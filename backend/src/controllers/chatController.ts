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
} from '../models';

export class ChatController {
  /**
   * Get all conversations for current user with unread counts and last message
   */
  static async getConversations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      // Find all conversation IDs where current user is participant
      const participantRows = await ConversationParticipant.findAll({
        where: { userId },
        attributes: ['conversationId', 'isPinned', 'isMuted', 'lastReadMessageId'],
      });

      const conversationIds = participantRows
        .map((p) => p.conversationId || (p as any).conversation_id || (p as any).dataValues?.conversationId || (p as any).dataValues?.conversation_id)
        .filter((id): id is string => typeof id === 'string' && id.trim().length > 0);

      if (conversationIds.length === 0) {
        return res.json({ success: true, data: { conversations: [] } });
      }

      // Fetch conversations with participants and latest messages
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
        order: [['updatedAt', 'DESC']],
      });

      // Calculate unread message counts for each conversation
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const participantInfo = participantRows.find((p) => p.conversationId === conv.id);
          
          const unreadCount = await Message.count({
            where: {
              conversationId: conv.id,
              senderId: { [Op.ne]: userId },
              status: { [Op.ne]: 'read' },
            },
          });

          const plain = conv.toJSON() as any;
          plain.unreadCount = unreadCount;
          plain.isPinned = participantInfo?.isPinned || false;
          plain.isMuted = participantInfo?.isMuted || false;
          plain.lastMessage = plain.messages && plain.messages.length > 0 ? plain.messages[0] : null;
          delete plain.messages;
          return plain;
        })
      );

      // Sort: pinned first, then by last message timestamp
      enrichedConversations.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.createdAt).getTime();
        const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });

      return res.json({ success: true, data: { conversations: enrichedConversations } });
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
   * Get Message History for a Conversation
   */
  static async getMessages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { conversationId } = req.params;
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;

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

      const messages = await Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']],
        limit,
        offset,
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
      });

      return res.json({ success: true, data: { messages } });
    } catch (err: any) {
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
}
