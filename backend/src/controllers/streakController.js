// /src/controllers/streakController.js
import { fetchGitHubData } from "../services/githubService.js";
import { calculateStreaks } from "../utils/streakCalculator.js";
import { generateStreakCard } from "../utils/streakCard.js";

// JSON API (optional)
export const getStreak = async (req, res) => {
  const { username } = req.params;
  try {
    const contributions = await fetchGitHubData(username);
    const { current, longest, currentRange, longestRange } = calculateStreaks(contributions);
    const total = contributions.reduce((sum, day) => sum + day.count, 0);
    
    // Get first and last contribution dates for total contributions range
    const contributionDays = contributions.filter(d => d.count > 0).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
    const firstContribution = contributionDays.length > 0 
      ? contributionDays[0].date 
      : null;
    const lastContribution = contributionDays.length > 0 
      ? contributionDays[contributionDays.length - 1].date 
      : null;

    // Debug logging
    console.log(`Streak calculation for ${username}: current=${current}, longest=${longest}, total=${total}, days=${contributions.length}`);

    const result = { username, current, longest, total };

    res.json(result);
  } catch (err) {
    // Log error for debugging but don't expose to user
    console.error(`Error fetching streak for ${username}:`, err.message);
    // Check for specific error types
    if (err.statusCode === 404 || err.response?.status === 404) {
      res.status(404).json({ error: "User not found" });
    } else if (err.statusCode === 403 || err.response?.status === 403) {
      res.status(403).json({ error: "Rate limit exceeded" });
    } else {
      res.status(500).json({ error: "Failed to fetch streak data" });
    }
  }
};

// PNG Card API
export const getStreakCard = async (req, res) => {
  const { username } = req.params;
  try {
    const contributions = await fetchGitHubData(username);
    const { current, longest, currentRange, longestRange } = calculateStreaks(contributions);
    const total = contributions.reduce((sum, day) => sum + day.count, 0);
    
    // Get first and last contribution dates for total contributions range
    const contributionDays = contributions.filter(d => d.count > 0);
    const firstContribution = contributionDays.length > 0 
      ? contributionDays[0].date 
      : null;
    const lastContribution = contributionDays.length > 0 
      ? contributionDays[contributionDays.length - 1].date 
      : null;

    // Log for monitoring (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Card generation for ${username}: current=${current}, longest=${longest}, total=${total}`);
    }

    // Optional: fetch avatar from GitHub
    const avatarUrl = `https://github.com/${username}.png`;

    // Extract theme parameter from query string and apply to multiple colors
    const colors = {};
    if (req.query.theme) {
      const themeHex = req.query.theme.replace('#', '');
      const themeColor = `#${themeHex}`;
      
      // Debug logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Applying theme: ${themeColor}`);
      }
      
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
      
      // Check if this is a white/light theme (ffffff or very light colors)
      const isLightTheme = themeHex.toLowerCase() === 'ffffff' || 
                           (parseInt(themeHex.substring(0, 2), 16) > 240 && 
                            parseInt(themeHex.substring(2, 4), 16) > 240 && 
                            parseInt(themeHex.substring(4, 6), 16) > 240);
      
      if (isLightTheme) {
        // Light theme: white/light background with dark text
        colors.background = '#ffffff'; // White background
        colors.backgroundGradient = '#f8f9fa'; // Very light gray gradient
        colors.border = '#e1e4e8'; // Light gray border
        colors.text = '#24292e'; // Dark text
        colors.dateText = '#586069'; // Medium gray for dates
        colors.accent = '#0366d6'; // Blue accent
        colors.avatarBorder = '#24292e'; // Dark border
        colors.totalCommits = '#24292e'; // Dark text
        colors.currentStreak = '#f97316'; // Orange for current streak
        colors.longestStreak = '#24292e'; // Dark text
        colors.divider = '#e1e4e8'; // Light gray divider
      } else {
        // Dark theme: dark background with light text
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
      
      // Debug logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('Generated colors:', colors);
      }
    }

    // Extract fontSize, hideAvatar, cardWidth, and cardHeight parameters
    const fontSize = req.query.fontSize || 'normal';
    const hideAvatar = req.query.hideAvatar === 'true';
    const cardWidth = parseInt(req.query.cardWidth) || 800;
    const cardHeight = parseInt(req.query.cardHeight) || 400;

    const buffer = await generateStreakCard({ 
      username, 
      current, 
      longest, 
      total, 
      avatarUrl, 
      colors,
      fontSize,
      hideAvatar,
      cardWidth,
      cardHeight,
      currentRange,
      longestRange,
      firstContribution,
      lastContribution
    });

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    // Log error for debugging but don't expose to user
    console.error(`Error generating card for ${username}:`, err.message);
    // Check for specific error types
    if (err.statusCode === 404 || err.response?.status === 404) {
      res.status(404).json({ error: "User not found" });
    } else if (err.statusCode === 403 || err.response?.status === 403) {
      res.status(403).json({ error: "Rate limit exceeded" });
    } else {
      // Generic error message - don't expose internal details
      res.status(500).json({ error: "Failed to generate streak card" });
    }
  }
};
