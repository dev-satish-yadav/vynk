import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ParticipantAttributes {
  id: string;
  conversationId: string;
  userId: string;
  role: 'admin' | 'member';
  isPinned: boolean;
  isMuted: boolean;
  lastReadMessageId?: string | null;
  joinedAt?: Date;
}

export interface ParticipantCreationAttributes
  extends Optional<ParticipantAttributes, 'id' | 'role' | 'isPinned' | 'isMuted' | 'lastReadMessageId' | 'joinedAt'> {}

export class ConversationParticipant
  extends Model<ParticipantAttributes, ParticipantCreationAttributes>
  implements ParticipantAttributes
{
  declare id: string;
  declare conversationId: string;
  declare userId: string;
  declare role: 'admin' | 'member';
  declare isPinned: boolean;
  declare isMuted: boolean;
  declare lastReadMessageId: string | null;
  declare joinedAt: Date;
}

ConversationParticipant.init(
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      defaultValue: 'member',
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_pinned',
    },
    isMuted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_muted',
    },
    lastReadMessageId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'last_read_message_id',
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'joined_at',
    },
  },
  {
    sequelize,
    tableName: 'conversation_participants',
    modelName: 'ConversationParticipant',
    timestamps: false,
  }
);
