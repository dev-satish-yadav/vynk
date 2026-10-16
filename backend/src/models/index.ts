import { sequelize } from '../config/database';
import { User } from './User';
import { Conversation } from './Conversation';
import { ConversationParticipant } from './ConversationParticipant';
import { Message } from './Message';
import { Attachment } from './Attachment';
import { MessageReceipt } from './MessageReceipt';
import { MessageDeletion } from './MessageDeletion';

// Set up associations

// User <-> Conversation (Many-to-Many via ConversationParticipant)
User.belongsToMany(Conversation, {
  through: ConversationParticipant,
  as: 'conversations',
  foreignKey: 'userId',
});
Conversation.belongsToMany(User, {
  through: ConversationParticipant,
  as: 'participants',
  foreignKey: 'conversationId',
});

// Explicit associations for the junction table
ConversationParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversationId', as: 'participantDetails' });

// Conversation Creator
Conversation.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// Conversation <-> Messages (One-to-Many)
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// Message <-> Sender (User)
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });

// Message <-> ReplyTo (Self-referencing)
Message.belongsTo(Message, { foreignKey: 'replyToId', as: 'replyTo' });

// Message <-> Attachment (One-to-Many)
Message.hasMany(Attachment, { foreignKey: 'messageId', as: 'attachments' });
Attachment.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });

// Message <-> Receipts
Message.hasMany(MessageReceipt, { foreignKey: 'messageId', as: 'receipts' });
MessageReceipt.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
MessageReceipt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Message <-> User Deletions (Delete for Me)
Message.hasMany(MessageDeletion, { foreignKey: 'messageId', as: 'deletions' });
MessageDeletion.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
User.hasMany(MessageDeletion, { foreignKey: 'userId', as: 'deletedMessages' });
MessageDeletion.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('[Sequelize] Database models synchronized successfully.');
  } catch (err: any) {
    console.warn('[Sequelize Warning] Database sync warning:', err.message);
  }
};

export {
  sequelize,
  User,
  Conversation,
  ConversationParticipant,
  Message,
  Attachment,
  MessageReceipt,
  MessageDeletion,
};
