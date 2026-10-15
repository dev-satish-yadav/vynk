import { redisClient, isRedisConnected } from '../config/redis';

// In-memory fallback if Redis is not running
const memoryPresence = new Map<string, Set<string>>(); // userId -> Set of socketIds
const memoryTyping = new Map<string, Set<string>>(); // conversationId -> Set of userIds

export class RedisService {
  /**
   * Track user socket connection for real-time presence
   */
  static async addUserSocket(userId: string, socketId: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.sadd(`user:${userId}:sockets`, socketId);
        await redisClient.set(`user:${userId}:presence`, 'online');
        return;
      } catch (err) {
        // Fallback to memory
      }
    }

    if (!memoryPresence.has(userId)) {
      memoryPresence.set(userId, new Set());
    }
    memoryPresence.get(userId)!.add(socketId);
  }

  /**
   * Remove user socket on disconnection
   */
  static async removeUserSocket(userId: string, socketId: string): Promise<boolean> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.srem(`user:${userId}:sockets`, socketId);
        const count = await redisClient.scard(`user:${userId}:sockets`);
        if (count === 0) {
          await redisClient.set(`user:${userId}:presence`, 'offline');
          await redisClient.set(`user:${userId}:last_seen`, new Date().toISOString());
          return true; // Completely offline
        }
        return false; // Still online on another device/tab
      } catch (err) {
        // Fallback to memory
      }
    }

    if (memoryPresence.has(userId)) {
      const set = memoryPresence.get(userId)!;
      set.delete(socketId);
      if (set.size === 0) {
        memoryPresence.delete(userId);
        return true; // Completely offline
      }
    }
    return false;
  }

  /**
   * Check if a user is currently online
   */
  static async isUserOnline(userId: string): Promise<boolean> {
    if (isRedisConnected && redisClient) {
      try {
        const presence = await redisClient.get(`user:${userId}:presence`);
        return presence === 'online';
      } catch (err) {
        // Fallback
      }
    }
    const set = memoryPresence.get(userId);
    return !!(set && set.size > 0);
  }

  /**
   * Set typing indicator with TTL
   */
  static async setTyping(conversationId: string, userId: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.set(`typing:${conversationId}:${userId}`, '1', 'EX', 4);
        return;
      } catch (err) {}
    }

    if (!memoryTyping.has(conversationId)) {
      memoryTyping.set(conversationId, new Set());
    }
    memoryTyping.get(conversationId)!.add(userId);
  }

  /**
   * Clear typing indicator
   */
  static async clearTyping(conversationId: string, userId: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.del(`typing:${conversationId}:${userId}`);
        return;
      } catch (err) {}
    }

    if (memoryTyping.has(conversationId)) {
      memoryTyping.get(conversationId)!.delete(userId);
    }
  }
}
