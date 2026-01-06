import { fetchGitHubData } from "../services/githubService.js";
import { calculateStreaks } from "../utils/streakCalculator.js";
import redisClient from "../utils/redisClient.js";

export const getStreak = async (req, res) => {
  const { username } = req.params;

  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    // 1️⃣ Check cache first
    const cached = await redisClient.get(username);
    if (cached) {
      console.log("Cache hit ✅");
      return res.json(JSON.parse(cached));
    }

    // 2️⃣ Fetch GitHub data if not cached
    const contributions = await fetchGitHubData(username);
    const streaks = calculateStreaks(contributions);

    const result = { username, ...streaks };

    // 3️⃣ Save result in Redis for 24 hours
    await redisClient.setEx(username, 24 * 60 * 60, JSON.stringify(result));
    console.log("Cache saved ✅");

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
};
