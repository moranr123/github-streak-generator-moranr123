import express from "express";
import { getStreak } from "../controllers/streakController.js";

const router = express.Router();

router.get("/:username", getStreak);

export default router;
