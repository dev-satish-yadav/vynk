import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface MessageDeletionAttributes {
  id: string;
  messageId: string;
  userId: string;
  createdAt?: Date;
}

export interface MessageDeletionCreationAttributes
  extends Optional<MessageDeletionAttributes, 'id' | 'createdAt'> {}

export class MessageDeletion
  extends Model<MessageDeletionAttributes, MessageDeletionCreationAttributes>
  implements MessageDeletionAttributes
{
  declare id: string;
  declare messageId: string;
  declare userId: string;
  declare readonly createdAt: Date;
}

MessageDeletion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'message_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'message_deletions',
    modelName: 'MessageDeletion',
    timestamps: true,
    updatedAt: false,
  }
);
