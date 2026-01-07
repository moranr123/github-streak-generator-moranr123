import express from "express";
import { getStreak, getStreakCard } from "../controllers/streakController.js";
import { getCacheStats, clearCache } from "../controllers/cacheController.js";
import { getHealth } from "../controllers/healthController.js";
import { validateUsername, validateCardParams } from "../middleware/validation.js";

const router = express.Router();

// Health check endpoint
router.get("/health", getHealth);

// Cache management endpoints
router.get("/cache/stats", getCacheStats);
router.delete("/cache", clearCache);

// JSON API endpoint
router.get("/:username", validateUsername, getStreak);

// Card generation endpoint
router.get("/card/:username", validateUsername, validateCardParams, getStreakCard);

export default router;
