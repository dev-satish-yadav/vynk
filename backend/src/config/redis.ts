import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export let redisClient: Redis | null = null;
export let redisPubClient: Redis | null = null;
export let redisSubClient: Redis | null = null;
export let isRedisConnected = false;

export const initRedis = () => {
  try {
    const options: any = {
      host: redisHost,
      port: redisPort,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times: number) => {
        if (times > 3) {
          // Stop retrying if Redis is not running locally so development isn't hung
          return null;
        }
        return Math.min(times * 100, 2000);
      },
    };

    if (redisPassword) {
      options.password = redisPassword;
    }

    redisClient = new Redis(options);
    redisPubClient = new Redis(options);
    redisSubClient = new Redis(options);

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log(`[Redis] Connected successfully to ${redisHost}:${redisPort}`);
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      // Friendly message during dev if Redis is not running yet
      console.warn(`[Redis Warning] Could not connect to Redis: ${err.message}. Falling back to memory state.`);
    });

    // Attempt connecting
    redisClient.connect().catch((err) => {
      console.warn(`[Redis] Offline mode active: ${err.message}`);
    });

    redisPubClient.connect().catch(() => {});
    redisSubClient.connect().catch(() => {});
  } catch (err: any) {
    console.warn('[Redis] Initialization error:', err.message);
  }
};
