// Cache removed - endpoints return disabled status
import { logger } from "../middleware/logger.js";

/**
 * Get cache statistics (caching disabled)
 */
export const getCacheStats = async (req, res) => {
  res.json({
    cache: {
      enabled: false,
      message: 'Caching is disabled'
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Clear cache (caching disabled - no-op)
 */
export const clearCache = async (req, res) => {
  res.json({ 
    message: 'Caching is disabled - no cache to clear' 
  });
};
