import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AttachmentAttributes {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt?: Date;
}

export interface AttachmentCreationAttributes extends Optional<AttachmentAttributes, 'id' | 'createdAt'> {}

export class Attachment extends Model<AttachmentAttributes, AttachmentCreationAttributes> implements AttachmentAttributes {
  declare id: string;
  declare messageId: string;
  declare fileName: string;
  declare fileUrl: string;
  declare fileType: string;
  declare fileSize: number;

  declare readonly createdAt: Date;
}

Attachment.init(
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
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_url',
    },
    fileType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'file_type',
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'file_size',
    },
  },
  {
    sequelize,
    tableName: 'attachments',
    modelName: 'Attachment',
    updatedAt: false,
  }
);
