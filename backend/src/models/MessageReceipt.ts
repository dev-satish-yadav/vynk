import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ReceiptAttributes {
  id: string;
  messageId: string;
  userId: string;
  status: 'delivered' | 'read';
  receiptTimestamp: Date;
}

export interface ReceiptCreationAttributes extends Optional<ReceiptAttributes, 'id' | 'receiptTimestamp'> {}

export class MessageReceipt extends Model<ReceiptAttributes, ReceiptCreationAttributes> implements ReceiptAttributes {
  declare id: string;
  declare messageId: string;
  declare userId: string;
  declare status: 'delivered' | 'read';
  declare receiptTimestamp: Date;
}

MessageReceipt.init(
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
    status: {
      type: DataTypes.ENUM('delivered', 'read'),
      allowNull: false,
    },
    receiptTimestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'receipt_timestamp',
    },
  },
  {
    sequelize,
    tableName: 'message_receipts',
    modelName: 'MessageReceipt',
    timestamps: false,
  }
);
