import axios from "axios";
import { logger } from "../middleware/logger.js";
import { cacheManager } from "../utils/cacheManager.js";
import { getGitHubDataCacheKey } from "../utils/cacheUtils.js";
import { CACHE_TTL } from "../utils/cacheUtils.js";

export const fetchGitHubData = async (username) => {
  // Check cache first
  const cacheKey = getGitHubDataCacheKey(username);
  const cached = await cacheManager.get(cacheKey);
  
  if (cached) {
    logger.info({ username }, 'GitHub data retrieved from cache');
    return cached;
  }

  // Check if GITHUB_TOKEN is set
  if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN === 'your_github_token_here') {
    const tokenError = new Error('GITHUB_TOKEN is not configured. Please set it in your .env file.');
    tokenError.statusCode = 500;
    logger.error({ error: tokenError.message }, 'GitHub token not configured');
    throw tokenError;
  }

  // Use GraphQL variables to prevent injection attacks
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const variables = { username };

  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      { query, variables },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
    
    const { data } = response;
    
    // Store rate limit info for potential use
    if (response.headers) {
      data._rateLimit = {
        remaining: response.headers['x-ratelimit-remaining'],
        limit: response.headers['x-ratelimit-limit'],
        reset: response.headers['x-ratelimit-reset']
      };
    }

    // Check for GraphQL errors
    if (data.errors) {
      const error = data.errors[0];
      if (error.type === 'NOT_FOUND') {
        const notFoundError = new Error('User not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      const graphqlError = new Error('GitHub API error');
      graphqlError.statusCode = 400;
      throw graphqlError;
    }

    // Check if user exists
    if (!data.data || !data.data.user) {
      const notFoundError = new Error('User not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;

    // Flatten weeks to daily list
    const days = weeks.flatMap(week =>
      week.contributionDays.map(day => ({
        date: day.date,
        count: day.contributionCount,
      }))
    );

    // Store rate limit info from response headers
    const rateLimitInfo = {
      remaining: response.headers['x-ratelimit-remaining'],
      limit: response.headers['x-ratelimit-limit'],
      reset: response.headers['x-ratelimit-reset']
    };

    // Prepare result
    const result = { days, rateLimitInfo };

    // Cache the result
    await cacheManager.set(cacheKey, result, CACHE_TTL.GITHUB_DATA);
    logger.info({ username }, 'GitHub data cached');

    // Return both days and rate limit info
    return result;
  } catch (err) {
    // Log the actual error for debugging
    logger.error({ 
      error: err.message, 
      status: err.response?.status,
      data: err.response?.data,
      stack: err.stack 
    }, 'GitHub API request failed');
    
    // Re-throw with status code if it has one
    if (err.statusCode) {
      throw err;
    }
    // Handle axios errors
    if (err.response) {
      if (err.response.status === 404) {
        const notFoundError = new Error('User not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
      } else if (err.response.status === 403) {
        const rateLimitError = new Error('Rate limit exceeded');
        rateLimitError.statusCode = 403;
        throw rateLimitError;
      } else if (err.response.status === 401) {
        const authError = new Error('GitHub authentication failed - invalid token');
        authError.statusCode = 500;
        throw authError;
      }
    }
    // Generic error for other cases
    const genericError = new Error('Failed to fetch GitHub data');
    genericError.statusCode = 500;
    throw genericError;
  }
};
