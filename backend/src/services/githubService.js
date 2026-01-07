import axios from "axios";
import { logger } from "../middleware/logger.js";
// Cache removed - no longer using caching

export const fetchGitHubData = async (username) => {
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

    // Prepare result
    const result = { days };

    // Return days
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
        const forbiddenError = new Error('Access forbidden');
        forbiddenError.statusCode = 403;
        throw forbiddenError;
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

/**
 * Fetch GitHub repository statistics
 */
export const fetchRepositoryStats = async (username) => {
  // Check if GITHUB_TOKEN is set
  if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN === 'your_github_token_here') {
    const tokenError = new Error('GITHUB_TOKEN is not configured. Please set it in your .env file.');
    tokenError.statusCode = 500;
    logger.error({ error: tokenError.message }, 'GitHub token not configured');
    throw tokenError;
  }

  const query = `
    query($username: String!, $first: Int!) {
      user(login: $username) {
        repositories(first: $first, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            name
            stargazerCount
            forkCount
            isPrivate
            isFork
            primaryLanguage {
              name
            }
          }
        }
      }
    }
  `;

  const variables = { username, first: 100 };

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

    if (!data.data || !data.data.user) {
      const notFoundError = new Error('User not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    const repositories = data.data.user.repositories.nodes;
    const totalRepos = data.data.user.repositories.totalCount;
    
    // Calculate statistics
    const publicRepos = repositories.filter(repo => !repo.isPrivate && !repo.isFork);
    const privateRepos = repositories.filter(repo => repo.isPrivate && !repo.isFork);
    const forks = repositories.filter(repo => repo.isFork);
    
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazerCount, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forkCount, 0);
    
    // Find most starred repository
    const mostStarredRepo = repositories.length > 0 
      ? repositories.reduce((max, repo) => 
          repo.stargazerCount > max.stargazerCount ? repo : max
        )
      : null;

    return {
      totalRepos,
      publicRepos: publicRepos.length,
      privateRepos: privateRepos.length,
      forks: forks.length,
      totalStars,
      totalForks,
      mostStarredRepo: mostStarredRepo ? {
        name: mostStarredRepo.name,
        stars: mostStarredRepo.stargazerCount
      } : null
    };
  } catch (err) {
    logger.error({ 
      error: err.message, 
      status: err.response?.status,
      data: err.response?.data,
      stack: err.stack 
    }, 'GitHub repository stats API request failed');
    
    if (err.statusCode) {
      throw err;
    }
    if (err.response) {
      if (err.response.status === 404) {
        const notFoundError = new Error('User not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
      } else if (err.response.status === 403) {
        const forbiddenError = new Error('Access forbidden');
        forbiddenError.statusCode = 403;
        throw forbiddenError;
      } else if (err.response.status === 401) {
        const authError = new Error('GitHub authentication failed - invalid token');
        authError.statusCode = 500;
        throw authError;
      }
    }
    const genericError = new Error('Failed to fetch GitHub repository statistics');
    genericError.statusCode = 500;
    throw genericError;
  }
};

