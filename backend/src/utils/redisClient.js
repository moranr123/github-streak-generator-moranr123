import { createClient } from 'redis';
import { logger } from '../middleware/logger.js';

let redisClient = null;

/**
 * Initialize Redis client with TLS support for Upstash
 */
export async function initializeRedis() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    logger.warn('REDIS_URL not set, caching will be disabled');
    return null;
  }

  try {
    // Parse Redis URL: redis://default:password@host:port
    const url = new URL(redisUrl);
    const password = url.password;
    const host = url.hostname;
    const port = parseInt(url.port) || 6379;

    redisClient = createClient({
      socket: {
        host,
        port,
        tls: true, // Upstash requires TLS
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection failed after 10 attempts');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      },
      password,
      username: url.username || 'default'
    });

    redisClient.on('error', (err) => {
      logger.error({ error: err.message }, 'Redis client error');
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to initialize Redis');
    redisClient = null;
    return null;
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient() {
  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}
