import { logger } from "../middleware/logger.js";
import { cacheManager } from "../utils/cacheManager.js";

/**
 * Get cache statistics
 */
export const getCacheStats = async (req, res) => {
  try {
    const stats = await cacheManager.getStats();
    res.json({
      cache: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting cache stats');
    res.status(500).json({
      error: 'Failed to get cache statistics',
      cache: { enabled: false }
    });
  }
};

/**
 * Clear cache
 */
export const clearCache = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (username) {
      // Clear cache for specific user
      const deleted = await cacheManager.deleteUserCache(username);
      logger.info({ username, deleted }, 'User cache cleared');
      res.json({ 
        message: `Cache cleared for user: ${username}`,
        deleted: deleted
      });
    } else {
      // Clear all cache - reset stats
      cacheManager.resetStats();
      logger.info('All cache statistics reset');
      res.json({ 
        message: 'Cache statistics reset. Note: Upstash Redis keys persist until TTL expires.',
        note: 'To clear specific keys, use ?username=username query parameter'
      });
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Error clearing cache');
    res.status(500).json({ 
      error: 'Failed to clear cache' 
    });
  }
};
