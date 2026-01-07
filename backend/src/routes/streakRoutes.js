import express from "express";
import { getStreak, getStreakCard } from "../controllers/streakController.js";
import { getCacheStats, clearCache } from "../controllers/cacheController.js";
import { apiLimiter, cardGenerationLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Cache management endpoints (before rate limiting)
router.get("/cache/stats", getCacheStats);
router.delete("/cache", clearCache);

// Apply general rate limiting to JSON API
router.get("/:username", apiLimiter, getStreak);

// Apply stricter rate limiting to card generation endpoint
router.get("/card/:username", cardGenerationLimiter, getStreakCard);

export default router;
