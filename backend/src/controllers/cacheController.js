import { cacheManager } from "../utils/cacheManager.js";
import { logger } from "../middleware/logger.js";

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
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
};

/**
 * Clear cache (admin endpoint)
 * Query params: pattern - optional pattern to match (e.g., 'github:data:*')
 */
export const clearCache = async (req, res) => {
  try {
    const { pattern } = req.query;
    
    if (pattern) {
      const deleted = await cacheManager.deletePattern(pattern);
      logger.info({ pattern, deleted }, 'Cache cleared by pattern');
      res.json({ 
        message: `Cache cleared for pattern: ${pattern}`,
        deleted 
      });
    } else {
      // Clear all cache
      await cacheManager.deletePattern('github:data:*');
      await cacheManager.deletePattern('card:*');
      logger.info('All cache cleared');
      res.json({ message: 'All cache cleared' });
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Error clearing cache');
    res.status(500).json({ error: 'Failed to clear cache' });
  }
};
