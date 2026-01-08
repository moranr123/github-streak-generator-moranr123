import { cacheManager } from '../utils/cacheManager.js';
import { getCardCacheKey } from '../utils/cacheUtils.js';
import { CACHE_TTL } from '../utils/cacheUtils.js';
import { logger } from './logger.js';

/**
 * Cache middleware for card generation endpoint
 * Checks cache before rate limiter - if cache hit, serves directly without counting against rate limit
 */
export const cardCacheMiddleware = async (req, res, next) => {
  // Only check cache if cache is enabled
  if (!cacheManager.isEnabled()) {
    return next();
  }

  try {
    let { username } = req.params;
    
    // Normalize username to lowercase (validation happens later, but we need normalized username for cache key)
    if (username) {
      username = username.trim().toLowerCase();
    }
    
    // If no username, continue to validation middleware which will handle the error
    if (!username) {
      return next();
    }
    
    const statType = req.query.statType || 'streak';
    const fontSize = req.query.fontSize || 'normal';
    const hideAvatar = req.query.hideAvatar === 'true';
    const cardWidth = parseInt(req.query.cardWidth) || 600;
    const cardHeight = parseInt(req.query.cardHeight) || 200;
    const themeHex = (req.query.theme || 'ffffff').replace('#', '');
    const displaySections = req.query.displaySections || '';

    // Build customization object for cache key
    const customization = {
      statType,
      theme: themeHex,
      fontSize,
      hideAvatar,
      cardWidth,
      cardHeight,
      displaySections // Include displaySections in cache key
    };

    // Generate cache key
    const cacheKey = getCardCacheKey(username, customization);

    // Check cache
    const cachedBuffer = await cacheManager.get(cacheKey);

    if (cachedBuffer) {
      // Cache hit - serve directly without counting against rate limit
      logger.info({ username, cacheKey }, 'Card served from cache');

      // Set HTTP headers for images
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // Set CORS headers for image responses
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }

      // Convert cached buffer (stored as base64 string)
      let buffer;
      if (typeof cachedBuffer === 'string') {
        // If stored as base64 string, convert to Buffer
        try {
          buffer = Buffer.from(cachedBuffer, 'base64');
        } catch (parseError) {
          // If base64 decode fails, try treating as raw string
          logger.warn({ error: parseError.message }, 'Failed to decode base64 cache, treating as raw buffer');
          buffer = Buffer.from(cachedBuffer);
        }
      } else if (Buffer.isBuffer(cachedBuffer)) {
        // Already a Buffer (shouldn't happen with current implementation, but handle it)
        buffer = cachedBuffer;
      } else {
        // Fallback: try to convert to Buffer
        logger.warn({ type: typeof cachedBuffer }, 'Unexpected cache value type, attempting conversion');
        buffer = Buffer.from(String(cachedBuffer));
      }

      res.send(buffer);
      return; // Don't call next() - request is complete
    }

    // Cache miss - continue to rate limiter and controller
    // Store cache key in request for controller to use
    req.cacheKey = cacheKey;
    next();
  } catch (error) {
    // If cache check fails, continue to next middleware (don't block request)
    logger.error({ error: error.message }, 'Error checking cache, continuing without cache');
    next();
  }
};
