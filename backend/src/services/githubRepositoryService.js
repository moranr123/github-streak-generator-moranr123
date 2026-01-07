import axios from "axios";
import { logger } from "../middleware/logger.js";
import { cacheManager } from "../utils/cacheManager.js";
import { CACHE_TTL } from "../utils/cacheUtils.js";

/**
 * Fetch user's repository count from GitHub API
 * @param {string} username - GitHub username
 * @returns {Promise<number>} Repository count
 */
export const getRepositoryCount = async (username) => {
  const cacheKey = `github:repos:${username.toLowerCase()}`;
  const cached = await cacheManager.get(cacheKey);
  
  if (cached !== null && cached !== undefined) {
    logger.info({ username }, 'Repository count retrieved from cache');
    return cached;
  }

  // Check if GITHUB_TOKEN is set
  if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN === 'your_github_token_here') {
    const tokenError = new Error('GITHUB_TOKEN is not configured. Please set it in your .env file.');
    tokenError.statusCode = 500;
    logger.error({ error: tokenError.message }, 'GitHub token not configured');
    throw tokenError;
  }

  // GraphQL query to fetch repository count
  const query = `
    query($username: String!) {
      user(login: $username) {
        repositories {
          totalCount
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

    const repositoryCount = data.data.user.repositories.totalCount;

    // Cache the result
    await cacheManager.set(cacheKey, repositoryCount, CACHE_TTL.GITHUB_DATA);
    logger.info({ username, repositoryCount }, 'Repository count cached');

    return repositoryCount;
  } catch (err) {
    logger.error({ 
      error: err.message, 
      status: err.response?.status,
      data: err.response?.data,
      stack: err.stack 
    }, 'GitHub repository count API request failed');
    
    if (err.statusCode) {
      throw err;
    }
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
    const genericError = new Error('Failed to fetch repository count');
    genericError.statusCode = 500;
    throw genericError;
  }
};
