import { Redis } from '@upstash/redis';
import { logger } from '../middleware/logger.js';

/**
 * Cache Manager - Redis/Upstash implementation
 */
class CacheManager {
  constructor() {
    this.enabled = false;
    this.redis = null;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Parse Redis connection string to extract REST API URL and token
   * @param {string} connectionString - Redis connection string (redis://default:TOKEN@HOST:PORT)
   * @returns {Object|null} Object with url and token, or null if invalid
   */
  parseConnectionString(connectionString) {
    try {
      // Format: redis://default:TOKEN@HOST:PORT
      // Example: redis://default:AWmJAAIncDJiMTgxODIwYzFhZjQ0YzIyYjQxYTdlZDljNjNjM2RjOXAyMjcwMTc@meet-civet-27017.upstash.io:6379
      const match = connectionString.match(/^redis:\/\/[^:]+:([^@]+)@([^:]+):(\d+)$/);
      if (!match) {
        return null;
      }

      const token = match[1];
      const host = match[2];
      
      // Convert to Upstash REST API URL format
      // Upstash REST API URL format: https://HOST (without port)
      // For example: meet-civet-27017.upstash.io -> https://meet-civet-27017.upstash.io
      let restUrl;
      if (host.includes('.upstash.io')) {
        // Use HTTPS with the same host (without port)
        restUrl = `https://${host}`;
      } else {
        // Fallback: try to construct from host
        restUrl = `https://${host}`;
      }

      return { url: restUrl, token };
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to parse Redis connection string');
      return null;
    }
  }

  /**
   * Initialize cache manager with Redis/Upstash
   */
  async initialize() {
    try {
      let redisUrl = process.env.UPSTASH_REDIS_REST_URL;
      let redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

      // If REST API credentials not found, try to parse from connection string
      if (!redisUrl || !redisToken) {
        const redisConnectionString = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
        
        if (redisConnectionString) {
          const parsed = this.parseConnectionString(redisConnectionString);
          if (parsed) {
            redisUrl = parsed.url;
            redisToken = parsed.token;
            logger.info('Parsed Redis REST API credentials from connection string');
          }
        }
      }

      if (!redisUrl || !redisToken) {
        logger.warn('Redis URL or token not found in environment variables. Caching disabled.');
        logger.warn('Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN, or REDIS_URL');
        this.enabled = false;
        return;
      }

      // Initialize Upstash Redis client
      this.redis = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      // Test connection
      await this.redis.ping();
      
      this.enabled = true;
      logger.info('Redis cache manager initialized successfully');
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to initialize Redis cache');
      this.enabled = false;
      this.redis = null;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null
   */
  async get(key) {
    if (!this.enabled || !this.redis) {
      this.stats.misses++;
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (value !== null) {
        this.stats.hits++;
        // Parse JSON if it's a string
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      logger.error({ error: error.message, key }, 'Error getting value from cache');
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = 3600) {
    if (!this.enabled || !this.redis) {
      return false;
    }

    try {
      // Serialize value to JSON if it's an object
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      // Set with TTL
      await this.redis.setex(key, ttl, serializedValue);
      this.stats.sets++;
      return true;
    } catch (error) {
      logger.error({ error: error.message, key }, 'Error setting value in cache');
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    if (!this.enabled || !this.redis) {
      return false;
    }

    try {
      await this.redis.del(key);
      this.stats.deletes++;
      return true;
    } catch (error) {
      logger.error({ error: error.message, key }, 'Error deleting value from cache');
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'github:data:*')
   * @returns {Promise<number>} Number of keys deleted
   */
  async deletePattern(pattern) {
    if (!this.enabled || !this.redis) {
      return 0;
    }

    try {
      // Upstash Redis doesn't support SCAN directly, so we'll use a workaround
      // For now, we'll need to track keys or use a different approach
      // This is a simplified version - in production, you might want to track keys
      logger.warn({ pattern }, 'Pattern deletion not fully supported with Upstash. Consider tracking keys.');
      return 0;
    } catch (error) {
      logger.error({ error: error.message, pattern }, 'Error deleting pattern from cache');
      return 0;
    }
  }

  /**
   * Delete all keys for a specific username
   * @param {string} username - GitHub username
   * @returns {Promise<number>} Number of keys deleted
   */
  async deleteUserCache(username) {
    if (!this.enabled || !this.redis) {
      return 0;
    }

    try {
      const patterns = [
        `github:data:${username.toLowerCase()}`,
        `card:${username.toLowerCase()}:*`,
      ];

      let deleted = 0;
      for (const pattern of patterns) {
        // For exact matches, delete directly
        if (!pattern.includes('*')) {
          const result = await this.delete(pattern);
          if (result) deleted++;
        } else {
          // For patterns, we'd need to track keys or use a different approach
          // For now, we'll log a warning
          logger.warn({ pattern }, 'Pattern deletion with wildcards not fully supported');
        }
      }

      return deleted;
    } catch (error) {
      logger.error({ error: error.message, username }, 'Error deleting user cache');
      return 0;
    }
  }

  /**
   * Check if cache is enabled
   * @returns {boolean} Cache enabled status
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get cache statistics
   * @returns {Promise<object>} Cache stats
   */
  async getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      enabled: this.enabled,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      hitRate: parseFloat(hitRate.toFixed(2)),
      total: total
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Close cache connection
   */
  async close() {
    if (this.redis) {
      // Upstash Redis is stateless, no connection to close
      this.redis = null;
      this.enabled = false;
      logger.info('Redis cache connection closed');
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
