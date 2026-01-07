import { getRedisClient } from './redisClient.js';
import { logger } from '../middleware/logger.js';
import { CACHE_TTL } from './cacheUtils.js';

/**
 * Cache Manager - Handles all caching operations
 */
class CacheManager {
  constructor() {
    this.client = null;
    this.enabled = false;
  }

  /**
   * Initialize cache manager
   */
  async initialize() {
    this.client = getRedisClient();
    this.enabled = !!this.client;
    
    if (this.enabled) {
      logger.info('Cache manager initialized with Redis');
    } else {
      logger.warn('Cache manager initialized without Redis (caching disabled)');
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null
   */
  async get(key) {
    if (!this.enabled || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      logger.error({ key, error: error.message }, 'Cache get error');
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
  async set(key, value, ttl = CACHE_TTL.GITHUB_DATA) {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      logger.error({ key, error: error.message }, 'Cache set error');
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error({ key, error: error.message }, 'Cache delete error');
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'github:data:*')
   * @returns {Promise<number>} Number of keys deleted
   */
  async deletePattern(pattern) {
    if (!this.enabled || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      await this.client.del(keys);
      logger.info({ pattern, count: keys.length }, 'Cache pattern deleted');
      return keys.length;
    } catch (error) {
      logger.error({ pattern, error: error.message }, 'Cache delete pattern error');
      return 0;
    }
  }

  /**
   * Check if cache is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get cache statistics
   * @returns {Promise<object>} Cache stats
   */
  async getStats() {
    if (!this.enabled || !this.client) {
      return { enabled: false };
    }

    try {
      const info = await this.client.info('stats');
      return {
        enabled: true,
        info
      };
    } catch (error) {
      logger.error({ error: error.message }, 'Cache stats error');
      return { enabled: true, error: error.message };
    }
  }

  /**
   * Close cache connection
   */
  async close() {
    if (this.client) {
      try {
        await this.client.quit();
        this.client = null;
        this.enabled = false;
        logger.info('Cache manager closed');
      } catch (error) {
        logger.error({ error: error.message }, 'Error closing cache manager');
      }
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
