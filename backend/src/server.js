import dotenv from "dotenv";
import app from "./app.js";
import { initializeRedis, closeRedis } from "./utils/redisClient.js";
import { cacheManager } from "./utils/cacheManager.js";
import { logger } from "./middleware/logger.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize Redis and cache manager before starting server
async function startServer() {
  try {
    // Initialize Redis connection
    await initializeRedis();
    
    // Initialize cache manager
    await cacheManager.initialize();
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info({ port: PORT }, 'Server running');
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to start server');
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await cacheManager.close();
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await cacheManager.close();
  await closeRedis();
  process.exit(0);
});

startServer();
