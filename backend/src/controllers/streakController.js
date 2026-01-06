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

    // Extract theme parameter from query string and apply to multiple colors
    const colors = {};
    if (req.query.theme) {
      const themeHex = req.query.theme.replace('#', '');
      const themeColor = `#${themeHex}`;
      
      // Convert hex to RGB
      const hexToRgb = (hex) => {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { r, g, b };
      };
      
      // Convert RGB to hex
      const rgbToHex = (r, g, b) => {
        return `#${[r, g, b].map(x => {
          const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
      };
      
      // Darken color by reducing RGB values
      const darken = (hex, factor) => {
        const { r, g, b } = hexToRgb(hex);
        return rgbToHex(r * factor, g * factor, b * factor);
      };
      
      // Lighten color by increasing RGB values towards white
      const lighten = (hex, factor) => {
        const { r, g, b } = hexToRgb(hex);
        return rgbToHex(r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor);
      };
      
      // Apply theme colors - create a cohesive color scheme
      colors.background = darken(themeHex, 0.12); // Very dark background (12% of original)
      colors.backgroundGradient = darken(themeHex, 0.18); // Slightly lighter gradient (18% of original)
      colors.border = darken(themeHex, 0.35); // Medium dark border (35% of original)
      colors.text = lighten(themeHex, 0.85); // Very light text (85% towards white)
      colors.accent = themeColor; // Theme color for accents
      colors.avatarBorder = themeColor;
      colors.totalCommits = themeColor;
      colors.currentStreak = lighten(themeHex, 0.85); // Light text
      colors.longestStreak = lighten(themeHex, 0.85); // Light text
    }

    const buffer = await generateStreakCard({ username, current, longest, total, avatarUrl, colors });

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate streak card" });
  }
};
