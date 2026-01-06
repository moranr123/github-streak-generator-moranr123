import { fetchGitHubData } from "../services/githubService.js";
import { calculateStreaks } from "../utils/streakCalculator.js";

export const getStreak = async (req, res) => {
  const { username } = req.params;

  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    // Fetch contributions
    const contributions = await fetchGitHubData(username);

    // Calculate streaks
    const streaks = calculateStreaks(contributions);

    res.json({
      username,
      ...streaks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
};
