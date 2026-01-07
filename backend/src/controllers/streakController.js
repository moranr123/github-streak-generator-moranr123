// /src/controllers/streakController.js
import { fetchGitHubData, fetchContributionGraphData } from "../services/githubService.js";
import { fetchUserLanguages } from "../services/githubLanguageService.js";
import { generateStreakCard } from "../utils/streakCard.js";
import { generateLanguagesCard, generateContributionGraphCard } from "../utils/statsCard.js";
import { logger } from "../middleware/logger.js";
// Cache removed - no longer using caching
import { processStreakData } from "../utils/streakUtils.js";

// JSON API (optional)
export const getStreak = async (req, res) => {
  const { username } = req.params;
  try {
    const result = await fetchGitHubData(username);
    const streakData = processStreakData(result);

    // Log streak calculation
    logger.info({ 
      username, 
      current: streakData.current, 
      longest: streakData.longest, 
      total: streakData.total, 
      daysCount: streakData.contributions.length 
    }, 'Streak calculated');

    const jsonResponse = { 
      username, 
      current: streakData.current, 
      longest: streakData.longest, 
      total: streakData.total 
    };

    res.json(jsonResponse);
  } catch (err) {
    // Log error for debugging but don't expose to user
    logger.error({ username, error: err.message, stack: err.stack }, 'Error fetching streak');
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

// Helper function to generate colors from theme
function generateColorsFromTheme(themeHex) {
  const colors = {};
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
  
  // Check if this is a white/light theme
  const isLightTheme = themeHex.toLowerCase() === 'ffffff' || 
                       (parseInt(themeHex.substring(0, 2), 16) > 240 && 
                        parseInt(themeHex.substring(2, 4), 16) > 240 && 
                        parseInt(themeHex.substring(4, 6), 16) > 240);
  
  if (isLightTheme) {
    // Light theme: white/light background with dark text
    colors.background = '#ffffff';
    colors.backgroundGradient = '#f8f9fa';
    colors.border = '#e1e4e8';
    colors.text = '#24292e'; // Dark text
    colors.dateText = '#586069'; // Medium gray for dates
    colors.accent = '#0366d6'; // Blue accent
    colors.avatarBorder = '#24292e';
    colors.totalCommits = '#24292e'; // Dark text
    colors.currentStreak = '#f97316'; // Orange for current streak
    colors.longestStreak = '#24292e'; // Dark text
    colors.divider = '#e1e4e8';
  } else {
    // Dark theme: dark background with light text
    colors.background = darken(themeHex, 0.12);
    colors.backgroundGradient = darken(themeHex, 0.18);
    colors.border = darken(themeHex, 0.35);
    colors.text = lighten(themeHex, 0.85);
    colors.accent = themeColor;
    colors.avatarBorder = themeColor;
    colors.totalCommits = themeColor;
    colors.currentStreak = lighten(themeHex, 0.85);
    colors.longestStreak = lighten(themeHex, 0.85);
  }
  
  return colors;
}

// PNG Card API
export const getStreakCard = async (req, res) => {
  const { username } = req.params;
  const statType = req.query.statType || 'streak'; // Default to streak
  
  try {
    const avatarUrl = `https://github.com/${username}.png`;
    const fontSize = req.query.fontSize || 'normal';
    const hideAvatar = req.query.hideAvatar === 'true';
    const cardWidth = parseInt(req.query.cardWidth) || 800;
    const cardHeight = parseInt(req.query.cardHeight) || 400;
    const themeHex = (req.query.theme || 'ffffff').replace('#', '');
    
    // Generate colors from theme
    const colors = generateColorsFromTheme(themeHex);

    // Generate card based on stat type (no caching)
    let buffer;
      if (statType === 'top_languages') {
        const languageData = await fetchUserLanguages(username);
        
        buffer = await generateLanguagesCard({
        username,
        languages: languageData.languages,
        avatarUrl,
        colors,
        fontSize,
        hideAvatar,
        cardWidth,
        cardHeight
      });
      
      logger.info({ username, languageCount: languageData.languages.length }, 'Languages card generated');
    } else if (statType === 'contribution_graph') {
        const graphData = await fetchContributionGraphData(username);
        
        buffer = await generateContributionGraphCard({
        username,
        weeks: graphData.weeks,
        avatarUrl,
        colors,
        fontSize,
        hideAvatar,
        cardWidth,
        cardHeight
      });
      
      logger.info({ username, weekCount: graphData.weeks.length }, 'Contribution graph card generated');
    } else {
        // Default: streak
        const result = await fetchGitHubData(username);
        const streakData = processStreakData(result);
        
        // Parse displaySections from comma-separated string to object
        let displaySectionsObj = {
          total: true,
          current: true,
          longest: true
        };
        
        if (req.query.displaySections) {
          const enabledSections = req.query.displaySections.split(',').map(s => s.trim());
          displaySectionsObj = {
            total: enabledSections.includes('total'),
            current: enabledSections.includes('current'),
            longest: enabledSections.includes('longest')
          };
        }

        buffer = await generateStreakCard({
        username, 
        current: streakData.current, 
        longest: streakData.longest, 
        total: streakData.total, 
        avatarUrl, 
        colors,
        fontSize,
        hideAvatar,
        cardWidth,
        cardHeight,
        currentRange: streakData.currentRange,
        longestRange: streakData.longestRange,
        firstContribution: streakData.firstContribution,
        lastContribution: streakData.lastContribution,
        displaySections: displaySectionsObj
      });
      
      logger.info({ username, current: streakData.current, longest: streakData.longest, displaySections: displaySectionsObj }, 'Streak card generated');
    }

    // Set HTTP headers for images (no caching)
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // Disable browser caching
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    
    // Set CORS headers for image responses
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    
    res.send(buffer);
  } catch (err) {
    // Log error for debugging but don't expose to user
    logger.error({ username, error: err.message, stack: err.stack }, 'Error generating card');
    // Check for specific error types
    if (err.statusCode === 404 || err.response?.status === 404) {
      res.status(404).json({ error: "User not found" });
    } else if (err.statusCode === 403 || err.response?.status === 403) {
      res.status(403).json({ error: "Rate limit exceeded" });
    } else if (err.message && err.message.includes('GITHUB_TOKEN')) {
      // Token configuration error
      res.status(500).json({ error: "Server configuration error: GitHub token not set" });
    } else {
      // Generic error message - don't expose internal details
      res.status(500).json({ error: "Failed to generate streak card" });
    }
  }
};
