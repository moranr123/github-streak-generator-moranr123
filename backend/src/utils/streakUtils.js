/**
 * Utility functions for streak calculations and data processing
 */

/**
 * Extract contributions from GitHub API result
 * Handles both old array format and new object format
 * @param {Array|Object} result - GitHub API result
 * @returns {Array} Array of contribution days
 */
export function extractContributions(result) {
  if (Array.isArray(result)) {
    // Old format (shouldn't happen but handle it)
    return result;
  } else if (result && result.days && Array.isArray(result.days)) {
    // New format
    return result.days;
  } else {
    throw new Error('Invalid data format received from GitHub API');
  }
}

// Rate limit headers removed - no longer setting rate limit headers

/**
 * Get first and last contribution dates
 * @param {Array} contributions - Array of contribution days
 * @returns {Object} Object with firstContribution and lastContribution dates
 */
export function getContributionDateRange(contributions) {
  const contributionDays = contributions
    .filter(d => d.count > 0)
    .sort((a, b) => {
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
  
  return { firstContribution, lastContribution };
}

import { calculateStreaks } from './streakCalculator.js';

/**
 * Process GitHub data and calculate streak statistics
 * @param {Array|Object} result - GitHub API result
 * @returns {Object} Processed streak data
 */
export function processStreakData(result) {
  const contributions = extractContributions(result);
  
  if (!Array.isArray(contributions) || contributions.length === 0) {
    throw new Error('No contribution data available');
  }
  
  const { current, longest, currentRange, longestRange } = calculateStreaks(contributions);
  const total = contributions.reduce((sum, day) => sum + day.count, 0);
  const { firstContribution, lastContribution } = getContributionDateRange(contributions);
  
  return {
    contributions,
    current,
    longest,
    currentRange,
    longestRange,
    total,
    firstContribution,
    lastContribution,
    // Rate limit info removed
  };
}
