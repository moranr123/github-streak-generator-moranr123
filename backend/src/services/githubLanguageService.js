import axios from "axios";
import { logger } from "../middleware/logger.js";
import { cacheManager } from "../utils/cacheManager.js";
import { CACHE_TTL } from "../utils/cacheUtils.js";

/**
 * Fetch user's top languages from GitHub API
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} Top languages data
 */
export const fetchUserLanguages = async (username) => {
  const cacheKey = `github:languages:${username.toLowerCase()}`;
  const cached = await cacheManager.get(cacheKey);
  
  if (cached) {
    logger.info({ username }, 'GitHub languages retrieved from cache');
    return cached;
  }

  // Check if GITHUB_TOKEN is set
  if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN === 'your_github_token_here') {
    const tokenError = new Error('GITHUB_TOKEN is not configured. Please set it in your .env file.');
    tokenError.statusCode = 500;
    logger.error({ error: tokenError.message }, 'GitHub token not configured');
    throw tokenError;
  }

  // GraphQL query to fetch repositories and their languages
  const query = `
    query($username: String!) {
      user(login: $username) {
        repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}, isFork: false) {
          nodes {
            name
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
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

    const repositories = data.data.user.repositories.nodes;
    
    // Aggregate language statistics
    const languageMap = {};
    
    repositories.forEach(repo => {
      repo.languages.edges.forEach(edge => {
        const langName = edge.node.name;
        const langSize = edge.size;
        
        if (!languageMap[langName]) {
          languageMap[langName] = {
            name: langName,
            color: edge.node.color || '#586e75',
            size: 0
          };
        }
        languageMap[langName].size += langSize;
      });
    });

    // Convert to array and sort by size
    const languages = Object.values(languageMap)
      .sort((a, b) => b.size - a.size)
      .slice(0, 10); // Top 10 languages

    // Store rate limit info from response headers
    const rateLimitInfo = {
      remaining: response.headers['x-ratelimit-remaining'],
      limit: response.headers['x-ratelimit-limit'],
      reset: response.headers['x-ratelimit-reset']
    };

    const result = { languages, rateLimitInfo };

    // Cache the result
    await cacheManager.set(cacheKey, result, CACHE_TTL.GITHUB_DATA);
    logger.info({ username, languageCount: languages.length }, 'GitHub languages cached');

    return result;
  } catch (err) {
    logger.error({ 
      error: err.message, 
      status: err.response?.status,
      data: err.response?.data,
      stack: err.stack 
    }, 'GitHub languages API request failed');
    
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
    const genericError = new Error('Failed to fetch GitHub languages');
    genericError.statusCode = 500;
    throw genericError;
  }
};
