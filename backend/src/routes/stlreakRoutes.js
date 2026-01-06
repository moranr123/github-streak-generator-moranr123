import express from "express";
import { getStreak } from "../controllers/streakController.js";

const router = express.Router();

// GET /api/streak/:username
router.get("/:username", getStreak);

export default router;
