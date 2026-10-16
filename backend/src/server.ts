import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { connectDatabase, sequelize } from './config/database';
import { initRedis, redisPubClient, redisSubClient, isRedisConnected } from './config/redis';
import { syncDatabase, User } from './models';
import { setupSocketHandlers } from './sockets/socketManager';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS configuration allowing localhost and local network mobile devices
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow all local network origins and development tools
    callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Root
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Vynk Real-Time Messaging Server',
    timestamp: new Date(),
    redis: isRedisConnected ? 'connected' : 'memory-fallback',
  });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Start Server and Services
const startServer = async () => {
  try {
    console.log('🚀 Initializing Vynk Backend Services...');

    // 1. Initialize Redis
    initRedis();

    // 2. Attach Redis Adapter to Socket.io if available
    if (redisPubClient && redisSubClient) {
      try {
        io.adapter(createAdapter(redisPubClient, redisSubClient));
        console.log('[Socket.io] Redis adapter attached for horizontal scaling.');
      } catch (e: any) {
        console.warn('[Socket.io] Running in standalone socket mode.');
      }
    }

    // 3. Connect and Sync Database (MySQL + Sequelize)
    const isDbConnected = await connectDatabase();
    if (isDbConnected) {
      await syncDatabase();
      // Reset any stale isOnline flags from previous server runs
      try {
        await User.update({ isOnline: false }, { where: { isOnline: true } });
        console.log('[Presence] Successfully reset stale online statuses.');
      } catch (err: any) {
        console.warn('[Presence] Note:', err.message);
      }
    }

    // 4. Register Socket event handlers
    setupSocketHandlers(io);

    // 5. Start listening
    server.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`✅ Vynk Backend running on port ${PORT}`);
      console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`=========================================`);
    });
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export { app, io, server };
