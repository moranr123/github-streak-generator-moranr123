// /src/controllers/streakController.js
import { fetchGitHubData } from "../services/githubService.js";
import { calculateStreaks } from "../utils/streakCalculator.js";
import { generateStreakCard } from "../utils/streakCard.js";

// JSON API (optional)
export const getStreak = async (req, res) => {
  const { username } = req.params;
  try {
    const contributions = await fetchGitHubData(username);
    const { current, longest } = calculateStreaks(contributions);
    const total = contributions.reduce((sum, day) => sum + day.count, 0);

    // Debug logging
    console.log(`Streak calculation for ${username}: current=${current}, longest=${longest}, total=${total}, days=${contributions.length}`);

    const result = { username, current, longest, total };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
};

// PNG Card API
export const getStreakCard = async (req, res) => {
  const { username } = req.params;
  try {
    const contributions = await fetchGitHubData(username);
    const { current, longest } = calculateStreaks(contributions);
    const total = contributions.reduce((sum, day) => sum + day.count, 0);

    // Debug logging
    console.log(`Card generation for ${username}: current=${current}, longest=${longest}, total=${total}`);

    // Optional: fetch avatar from GitHub
    const avatarUrl = `https://github.com/${username}.png`;

    const buffer = await generateStreakCard({ username, current, longest, total, avatarUrl });

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate streak card" });
  }
};
