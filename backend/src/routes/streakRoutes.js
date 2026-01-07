import express from "express";
import { getStreak, getStreakCard } from "../controllers/streakController.js";
import { getCacheStats, clearCache } from "../controllers/cacheController.js";
import { getHealth } from "../controllers/healthController.js";
import { apiLimiter, cardGenerationLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Health check endpoint (no rate limiting)
router.get("/health", getHealth);

// Cache management endpoints (with rate limiting)
router.get("/cache/stats", apiLimiter, getCacheStats);
router.delete("/cache", apiLimiter, clearCache);

import { validateUsername, validateCardParams } from "../middleware/validation.js";

// Apply general rate limiting to JSON API
router.get("/:username", apiLimiter, validateUsername, getStreak);

// Apply stricter rate limiting to card generation endpoint
router.get("/card/:username", cardGenerationLimiter, validateUsername, validateCardParams, getStreakCard);

export default router;
