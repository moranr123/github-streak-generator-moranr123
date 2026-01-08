import crypto from 'crypto';

/**
 * Generate cache key for GitHub API data
 * @param {string} username - GitHub username
 * @returns {string} Cache key
 */
export function getGitHubDataCacheKey(username) {
  return `github:data:${username.toLowerCase()}`;
}

/**
 * Generate cache key for generated card image
 * @param {string} username - GitHub username
 * @param {object} customization - Customization options
 * @returns {string} Cache key
 */
export function getCardCacheKey(username, customization) {
  const { statType = 'streak', theme, fontSize, hideAvatar, cardWidth, cardHeight, displaySections = '' } = customization;
  
  // Create a hash of customization options for consistent cache keys
  // Include displaySections in the cache key to differentiate cards with different sections
  const customString = `${statType}-${theme}-${fontSize}-${hideAvatar}-${cardWidth}-${cardHeight}-${displaySections}`;
  const hash = crypto.createHash('md5').update(customString).digest('hex');
  
  return `card:${username.toLowerCase()}:${hash}`;
}

/**
 * Generate ETag for card based on cache key
 * @param {string} cacheKey - Cache key
 * @returns {string} ETag value
 */
export function generateETag(cacheKey) {
  return crypto.createHash('md5').update(cacheKey).digest('hex');
}

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  GITHUB_DATA: 3600,      // 1 hour - GitHub contributions update daily
  CARD_IMAGE: 86400,      // 24 hours - Same input = same output
};
