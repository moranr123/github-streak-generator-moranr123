// /src/controllers/streakController.js
import { fetchGitHubData } from "../services/githubService.js";
import { fetchUserLanguages } from "../services/githubLanguageService.js";
import { getRepositoryCount } from "../services/githubRepositoryService.js";
import { generateStreakCard } from "../utils/streakCard.js";
import { generateLanguagesCard, generateContributionsCard, generateRepositoriesCard } from "../utils/statsCard.js";
import { logger } from "../middleware/logger.js";
import { cacheManager } from "../utils/cacheManager.js";
import { getCardCacheKey, generateETag, CACHE_TTL } from "../utils/cacheUtils.js";
import { processStreakData, setRateLimitHeaders } from "../utils/streakUtils.js";

// JSON API (optional)
export const getStreak = async (req, res) => {
  const { username } = req.params;
  try {
    const result = await fetchGitHubData(username);
    const streakData = processStreakData(result);
    
    // Forward rate limit headers if available
    setRateLimitHeaders(res, streakData.rateLimitInfo);

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
    colors.background = '#ffffff';
    colors.text = '#24292e';
    colors.accent = '#0366d6';
  } else {
    colors.background = darken(themeHex, 0.12);
    colors.text = lighten(themeHex, 0.85);
    colors.accent = themeColor;
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

    // Create customization object for cache key (include statType)
    const customization = {
      statType,
      theme: themeHex,
      fontSize,
      hideAvatar,
      cardWidth,
      cardHeight
    };

    // Check cache for generated card
    const cacheKey = getCardCacheKey(username, customization);
    const etag = generateETag(cacheKey);
    
    // Check if client has cached version
    const clientETag = req.headers['if-none-match'];
    if (clientETag === `"${etag}"`) {
      res.status(304).end(); // Not Modified
      return;
    }

    let buffer;
    const cachedBuffer = await cacheManager.get(cacheKey);
    
    if (cachedBuffer && cachedBuffer.data) {
      // Convert base64 string back to buffer
      buffer = Buffer.from(cachedBuffer.data, 'base64');
      logger.info({ username, statType, cacheKey }, 'Card retrieved from cache');
    } else {
      // Generate card based on stat type
      if (statType === 'top_languages') {
        const languageData = await fetchUserLanguages(username);
        setRateLimitHeaders(res, languageData.rateLimitInfo);
        
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
      } else if (statType === 'contributions') {
        const result = await fetchGitHubData(username);
        const streakData = processStreakData(result);
        setRateLimitHeaders(res, streakData.rateLimitInfo);
        
        buffer = await generateContributionsCard({
          username,
          total: streakData.total,
          avatarUrl,
          colors,
          fontSize,
          hideAvatar,
          cardWidth,
          cardHeight
        });
        
        logger.info({ username, total: streakData.total }, 'Contributions card generated');
      } else if (statType === 'repositories') {
        const repoCount = await getRepositoryCount(username);
        // Note: getRepositoryCount doesn't return rateLimitInfo, so we'll skip setting headers
        // In production, you might want to modify the service to return rate limit info
        
        buffer = await generateRepositoriesCard({
          username,
          repositoryCount: repoCount,
          avatarUrl,
          colors,
          fontSize,
          hideAvatar,
          cardWidth,
          cardHeight
        });
        
        logger.info({ username, repositoryCount: repoCount }, 'Repositories card generated');
      } else {
        // Default: streak
        const result = await fetchGitHubData(username);
        const streakData = processStreakData(result);
        setRateLimitHeaders(res, streakData.rateLimitInfo);

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
          lastContribution: streakData.lastContribution
        });
        
        logger.info({ username, current: streakData.current, longest: streakData.longest }, 'Streak card generated');
      }

      // Cache the buffer as base64
      await cacheManager.set(cacheKey, {
        data: buffer.toString('base64'),
        contentType: 'image/png'
      }, CACHE_TTL.CARD_IMAGE);
      
      logger.info({ username, statType, cacheKey }, 'Card generated and cached');
    }

    // Set HTTP cache headers and CORS headers for images
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour browser cache
    res.setHeader("ETag", `"${etag}"`);
    res.setHeader("Last-Modified", new Date().toUTCString());
    
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
