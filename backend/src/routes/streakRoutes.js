import express from "express";
import { getStreak } from "../controllers/streakController.js";

const router = express.Router();

router.get("/:username", getStreak);          // JSON API
router.get("/card/:username", getStreakCard); // PNG card API

export default router;
