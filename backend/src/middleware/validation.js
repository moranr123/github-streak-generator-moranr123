import { logger } from "./logger.js";

/**
 * Validate GitHub username parameter
 * GitHub username rules: alphanumeric and hyphens, 1-39 characters, cannot start/end with hyphen
 */
export const validateUsername = (req, res, next) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required' });
  }
  
  // GitHub username validation
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,37}[a-zA-Z0-9]$/;
  
  if (!usernameRegex.test(username.trim())) {
    logger.warn({ username }, 'Invalid username format');
    return res.status(400).json({ error: 'Invalid GitHub username format' });
  }
  
  // Sanitize username (remove any potential injection attempts)
  req.params.username = username.trim().toLowerCase();
  next();
};

/**
 * Validate query parameters for card generation
 */
export const validateCardParams = (req, res, next) => {
  const { statType, theme, fontSize, hideAvatar, cardWidth, cardHeight, displaySections } = req.query;
  
  // Validate statType
  const validStatTypes = ['streak', 'top_languages'];
  if (statType && !validStatTypes.includes(statType)) {
    return res.status(400).json({ error: `Invalid statType. Must be one of: ${validStatTypes.join(', ')}` });
  }
  
  // Validate theme (hex color without #)
  if (theme && !/^[0-9A-Fa-f]{6}$/.test(theme.replace('#', ''))) {
    return res.status(400).json({ error: 'Invalid theme color format. Use hex color without # (e.g., ffffff)' });
  }
  
  // Validate fontSize
  const validFontSizes = ['small', 'normal', 'large'];
  if (fontSize && !validFontSizes.includes(fontSize)) {
    return res.status(400).json({ error: `Invalid fontSize. Must be one of: ${validFontSizes.join(', ')}` });
  }
  
  // Validate hideAvatar (boolean)
  if (hideAvatar && hideAvatar !== 'true' && hideAvatar !== 'false') {
    return res.status(400).json({ error: 'hideAvatar must be "true" or "false"' });
  }
  
  // Validate displaySections (only for streak stat type)
  // Format: comma-separated string like "total,current" or "total,current,longest"
  if (displaySections) {
    const validSectionKeys = ['total', 'current', 'longest'];
    const sections = displaySections.split(',');
    const invalidSections = sections.filter(s => !validSectionKeys.includes(s.trim()));
    if (invalidSections.length > 0) {
      return res.status(400).json({ error: `Invalid displaySections. Valid sections are: ${validSectionKeys.join(', ')}` });
    }
  }
  
  // Validate cardWidth
  if (cardWidth) {
    const width = parseInt(cardWidth);
    if (isNaN(width) || width < 400 || width > 2000) {
      return res.status(400).json({ error: 'cardWidth must be a number between 400 and 2000' });
    }
  }
  
  // Validate cardHeight
  if (cardHeight) {
    const height = parseInt(cardHeight);
    if (isNaN(height) || height < 200 || height > 1200) {
      return res.status(400).json({ error: 'cardHeight must be a number between 200 and 1200' });
    }
  }
  
  next();
};
