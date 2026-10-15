import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
  about?: string | null;
  isOnline: boolean;
  lastSeen: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'avatarUrl' | 'about' | 'isOnline' | 'lastSeen' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare username: string;
  declare email: string;
  declare passwordHash: string;
  declare avatarUrl: string | null;
  declare about: string | null;
  declare isOnline: boolean;
  declare lastSeen: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'avatar_url',
    },
    about: {
      type: DataTypes.STRING(150),
      defaultValue: 'Hey there! I am using Vynk.',
      allowNull: true,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_online',
    },
    lastSeen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'last_seen',
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
  }
);
