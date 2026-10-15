import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ConversationAttributes {
  id: string;
  isGroup: boolean;
  title?: string | null;
  avatarUrl?: string | null;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, 'id' | 'title' | 'avatarUrl' | 'createdById' | 'createdAt' | 'updatedAt'> {}

export class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  declare id: string;
  declare isGroup: boolean;
  declare title: string | null;
  declare avatarUrl: string | null;
  declare createdById: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    isGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_group',
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'avatar_url',
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by_id',
    },
  },
  {
    sequelize,
    tableName: 'conversations',
    modelName: 'Conversation',
  }
);
