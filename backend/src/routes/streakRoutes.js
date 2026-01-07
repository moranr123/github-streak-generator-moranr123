import express from "express";
import { getStreak, getStreakCard } from "../controllers/streakController.js";
import { getCacheStats, clearCache } from "../controllers/cacheController.js";
import { getHealth } from "../controllers/healthController.js";
import { validateUsername, validateCardParams } from "../middleware/validation.js";
import { generalApiLimiter, cardGenerationLimiter, strictLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Health check endpoint (no rate limit - needed for monitoring)
router.get("/health", getHealth);

// Cache management endpoints (strict rate limit)
router.get("/cache/stats", strictLimiter, getCacheStats);
router.delete("/cache", strictLimiter, clearCache);

// JSON API endpoint (general rate limit)
router.get("/:username", generalApiLimiter, validateUsername, getStreak);

// Card generation endpoint (stricter rate limit - resource intensive)
router.get("/card/:username", cardGenerationLimiter, validateUsername, validateCardParams, getStreakCard);

export default router;
