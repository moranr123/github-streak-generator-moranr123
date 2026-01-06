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

    // Extract color parameters from query string
    const colors = {};
    if (req.query.bg) colors.background = `#${req.query.bg.replace('#', '')}`;
    if (req.query.bgGradient) colors.backgroundGradient = `#${req.query.bgGradient.replace('#', '')}`;
    if (req.query.border) colors.border = `#${req.query.border.replace('#', '')}`;
    if (req.query.text) colors.text = `#${req.query.text.replace('#', '')}`;
    if (req.query.accent) colors.accent = `#${req.query.accent.replace('#', '')}`;
    if (req.query.currentStreak) colors.currentStreak = `#${req.query.currentStreak.replace('#', '')}`;
    if (req.query.longestStreak) colors.longestStreak = `#${req.query.longestStreak.replace('#', '')}`;
    if (req.query.totalCommits) colors.totalCommits = `#${req.query.totalCommits.replace('#', '')}`;
    if (req.query.avatarBorder) colors.avatarBorder = `#${req.query.avatarBorder.replace('#', '')}`;

    const buffer = await generateStreakCard({ username, current, longest, total, avatarUrl, colors });

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate streak card" });
  }
};
