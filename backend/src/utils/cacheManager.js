import { logger } from '../middleware/logger.js';

/**
 * Cache Manager - No-op cache (caching disabled)
 */
class CacheManager {
  constructor() {
    this.enabled = false;
  }

  /**
   * Initialize cache manager
   */
  async initialize() {
    this.enabled = false;
    logger.info('Cache manager initialized (caching disabled)');
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Always returns null (caching disabled)
   */
  async get(key) {
    return null;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Always returns false (caching disabled)
   */
  async set(key, value, ttl) {
    return false;
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Always returns false (caching disabled)
   */
  async delete(key) {
    return false;
  }

  /**
   * Delete multiple keys matching a pattern
   * @param {string} pattern - Pattern to match
   * @returns {Promise<number>} Always returns 0 (caching disabled)
   */
  async deletePattern(pattern) {
    return 0;
  }

  /**
   * Check if cache is enabled
   * @returns {boolean} Always returns false
   */
  isEnabled() {
    return false;
  }

  /**
   * Get cache statistics
   * @returns {Promise<object>} Cache stats
   */
  async getStats() {
    return { enabled: false };
  }

  /**
   * Close cache connection
   */
  async close() {
    // No-op
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
