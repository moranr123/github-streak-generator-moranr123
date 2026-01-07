// /src/controllers/streakController.js
import { fetchGitHubData, fetchRepositoryStats } from "../services/githubService.js";
import { fetchUserLanguages } from "../services/githubLanguageService.js";
import { generateStreakCard } from "../utils/streakCard.js";
import { generateLanguagesCard, generateRepositoryStatsCard } from "../utils/statsCard.js";
import { logger } from "../middleware/logger.js";
import { processStreakData } from "../utils/streakUtils.js";
import { generateColorsFromTheme } from "../utils/colorUtils.js";

/**
 * Handle API errors and send appropriate response
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 * @param {string} context - Error context for logging
 * @param {string} username - Username for logging
 */
function handleApiError(err, res, context, username = '') {
  logger.error({ username, error: err.message, stack: err.stack }, context);
  
  if (err.statusCode === 404 || err.response?.status === 404) {
    res.status(404).json({ error: "User not found" });
  } else if (err.statusCode === 403 || err.response?.status === 403) {
    res.status(403).json({ error: "Rate limit exceeded" });
  } else if (err.message && err.message.includes('GITHUB_TOKEN')) {
    res.status(500).json({ error: "Server configuration error: GitHub token not set" });
  } else {
    res.status(500).json({ error: context.includes('card') ? "Failed to generate streak card" : "Failed to fetch streak data" });
  }
}

// JSON API (optional)
export const getStreak = async (req, res) => {
  const { username } = req.params;
  try {
    const result = await fetchGitHubData(username);
    const streakData = processStreakData(result);

    logger.info({ 
      username, 
      current: streakData.current, 
      longest: streakData.longest, 
      total: streakData.total, 
      daysCount: streakData.contributions.length 
    }, 'Streak calculated');

    res.json({ 
      username, 
      current: streakData.current, 
      longest: streakData.longest, 
      total: streakData.total 
    });
  } catch (err) {
    handleApiError(err, res, 'Error fetching streak', username);
  }
};

// PNG Card API
export const getStreakCard = async (req, res) => {
  const { username } = req.params;
  const statType = req.query.statType || 'streak'; // Default to streak
  
  try {
    const avatarUrl = `https://github.com/${username}.png`;
    const fontSize = req.query.fontSize || 'normal';
    const hideAvatar = req.query.hideAvatar === 'true';
    const cardWidth = parseInt(req.query.cardWidth) || 600;
    const cardHeight = parseInt(req.query.cardHeight) || 200;
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
    } else if (statType === 'repository_stats') {
        const repoStats = await fetchRepositoryStats(username);
        
        buffer = await generateRepositoryStatsCard({
        username,
        stats: repoStats,
        avatarUrl,
        colors,
        fontSize,
        hideAvatar,
        cardWidth,
        cardHeight
      });
      
      logger.info({ username, totalRepos: repoStats.totalRepos, totalStars: repoStats.totalStars }, 'Repository stats card generated');
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
    handleApiError(err, res, 'Error generating card', username);
  }
};
