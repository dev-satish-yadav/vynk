import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME || 'vynk_db';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = Number(process.env.DB_PORT) || 3306;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? false : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] MySQL connected successfully to ${dbName} at ${dbHost}:${dbPort}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database Warning] Unable to connect to MySQL database '${dbName}':`, error.message);
    console.warn('[Database Warning] Please ensure MySQL is running and database exists (`CREATE DATABASE vynk_db;`).');
    return false;
  }
};
