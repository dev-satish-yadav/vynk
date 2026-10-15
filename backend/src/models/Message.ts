import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface MessageAttributes {
  id: string;
  conversationId: string;
  senderId: string;
  replyToId?: string | null;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'system';
  status: 'sent' | 'delivered' | 'read';
  isDeletedEveryone: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageCreationAttributes
  extends Optional<MessageAttributes, 'id' | 'replyToId' | 'messageType' | 'status' | 'isDeletedEveryone' | 'createdAt' | 'updatedAt'> {}

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  declare id: string;
  declare conversationId: string;
  declare senderId: string;
  declare replyToId: string | null;
  declare content: string;
  declare messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'system';
  declare status: 'sent' | 'delivered' | 'read';
  declare isDeletedEveryone: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'conversation_id',
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'sender_id',
    },
    replyToId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'reply_to_id',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'document', 'system'),
      defaultValue: 'text',
      field: 'message_type',
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read'),
      defaultValue: 'sent',
    },
    isDeletedEveryone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted_everyone',
    },
  },
  {
    sequelize,
    tableName: 'messages',
    modelName: 'Message',
  }
);
