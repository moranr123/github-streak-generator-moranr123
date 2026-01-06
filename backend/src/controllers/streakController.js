import { fetchGitHubData } from "../services/githubService.js";
import { calculateStreaks } from "../utils/streakCalculator.js";
import redisClient from "../utils/redisClient.js";
import { generateStreakCard } from "../utils/streakCard.js";

// Existing JSON API
export const getStreak = async (req, res) => {
  const { username } = req.params;
  try {
    const cached = await redisClient.get(username);
    if (cached) return res.json(JSON.parse(cached));

    const contributions = await fetchGitHubData(username);
    const streaks = calculateStreaks(contributions);
    const result = { username, ...streaks };

    await redisClient.setEx(username, 24*60*60, JSON.stringify(result));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
};

// NEW: PNG card API
export const getStreakCard = async (req, res) => {
  const { username } = req.params;
  try {
    const cached = await redisClient.get(`card:${username}`);
    if (cached) {
      console.log("Cache hit for card ✅");
      res.setHeader("Content-Type", "image/png");
      return res.send(Buffer.from(cached, "base64"));
    }

    const contributions = await fetchGitHubData(username);
    const { current, longest } = calculateStreaks(contributions);

    const buffer = await generateStreakCard({ username, current, longest });

    // Cache as base64 string for simplicity
    await redisClient.setEx(`card:${username}`, 24*60*60, buffer.toString("base64"));

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate streak card" });
  }
};
