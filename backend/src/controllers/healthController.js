import { cacheManager } from "../utils/cacheManager.js";
import { getRedisClient } from "../utils/redisClient.js";
import { logger } from "../middleware/logger.js";

/**
 * Health check endpoint
 * Returns service status and dependencies
 */
export const getHealth = async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      dependencies: {
        cache: {
          enabled: cacheManager.isEnabled(),
          status: 'ok'
        }
      }
    };

    // Check Redis connection if enabled
    if (cacheManager.isEnabled()) {
      try {
        const redisClient = getRedisClient();
        if (redisClient) {
          await redisClient.ping();
          health.dependencies.cache.status = 'ok';
        } else {
          health.dependencies.cache.status = 'disconnected';
          health.status = 'degraded';
        }
      } catch (error) {
        health.dependencies.cache.status = 'error';
        health.dependencies.cache.error = error.message;
        health.status = 'degraded';
        logger.warn({ error: error.message }, 'Redis health check failed');
      }
    }

    // Check GitHub token
    if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN === 'your_github_token_here') {
      health.dependencies.github = {
        status: 'not_configured',
        message: 'GITHUB_TOKEN not set'
      };
      health.status = 'degraded';
    } else {
      health.dependencies.github = {
        status: 'configured'
      };
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error({ error: error.message }, 'Health check failed');
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
};
