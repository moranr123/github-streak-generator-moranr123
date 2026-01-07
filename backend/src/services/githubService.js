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

  // First, check if we're querying the authenticated user's own account
  // This is important because we can only see private repos for our own account
  let authenticatedUsername = null;
  try {
    const viewerQuery = `
      query {
        viewer {
          login
        }
      }
    `;
    const viewerResponse = await axios.post(
      "https://api.github.com/graphql",
      { query: viewerQuery },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
    if (viewerResponse.data.data?.viewer) {
      authenticatedUsername = viewerResponse.data.data.viewer.login.toLowerCase();
    }
  } catch (err) {
    logger.warn({ error: err.message }, 'Failed to get authenticated user');
  }

  const isOwnAccount = authenticatedUsername && authenticatedUsername === username.toLowerCase();

  // Fetch all repositories using pagination
  let allRepositories = [];
  let hasNextPage = true;
  let cursor = null;
  let totalRepos = 0;
  let publicReposCountFromAPI = 0;
  let privateReposCountFromAPI = 0;

  try {
    // First, get accurate counts using privacy filters (only works for own account or if token has access)
    if (isOwnAccount) {
      try {
        // Try using viewer instead of user query for own account (more reliable)
        const countQuery = `
          query {
            viewer {
              publicRepositories: repositories(first: 1, ownerAffiliations: OWNER, privacy: PUBLIC) {
                totalCount
              }
              privateRepositories: repositories(first: 1, ownerAffiliations: OWNER, privacy: PRIVATE) {
                totalCount
              }
            }
          }
        `;
        
        const countResponse = await axios.post(
          "https://api.github.com/graphql",
          { query: countQuery },
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            },
          }
        );
        
        if (countResponse.data.data?.viewer) {
          publicReposCountFromAPI = countResponse.data.data.viewer.publicRepositories?.totalCount || 0;
          privateReposCountFromAPI = countResponse.data.data.viewer.privateRepositories?.totalCount || 0;
          logger.info({ 
            username, 
            isOwnAccount: true,
            publicReposFromAPI: publicReposCountFromAPI,
            privateReposFromAPI: privateReposCountFromAPI
          }, 'Got separate public/private repo counts from API using viewer');
        }
      } catch (err) {
        logger.warn({ error: err.message, stack: err.stack }, 'Failed to get separate repo counts using viewer, trying user query');
        
        // Fallback to user query
        try {
          const countQuery = `
            query($username: String!) {
              user(login: $username) {
                publicRepositories: repositories(first: 1, ownerAffiliations: OWNER, privacy: PUBLIC) {
                  totalCount
                }
                privateRepositories: repositories(first: 1, ownerAffiliations: OWNER, privacy: PRIVATE) {
                  totalCount
                }
              }
            }
          `;
          
          const countResponse = await axios.post(
            "https://api.github.com/graphql",
            { query: countQuery, variables: { username } },
            {
              headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              },
            }
          );
          
          if (countResponse.data.data?.user) {
            publicReposCountFromAPI = countResponse.data.data.user.publicRepositories?.totalCount || 0;
            privateReposCountFromAPI = countResponse.data.data.user.privateRepositories?.totalCount || 0;
            logger.info({ 
              username, 
              isOwnAccount: true,
              publicReposFromAPI: publicReposCountFromAPI,
              privateReposFromAPI: privateReposCountFromAPI
            }, 'Got separate public/private repo counts from API using user query');
          }
        } catch (err2) {
          logger.warn({ error: err2.message }, 'Failed to get separate repo counts using user query');
        }
      }
    }

    while (hasNextPage) {
      const query = `
        query($username: String!, $first: Int!, $after: String) {
          user(login: $username) {
            repositories(first: $first, after: $after, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
              totalCount
              pageInfo {
                hasNextPage
                endCursor
              }
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
            publicRepositories: repositories(first: 1, ownerAffiliations: OWNER, privacy: PUBLIC) {
              totalCount
            }
            privateRepositories: repositories(first: 1, ownerAffiliations: OWNER, privacy: PRIVATE) {
              totalCount
            }
          }
        }
      `;

      const variables = { username, first: 100, after: cursor };

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

      const repoData = data.data.user.repositories;
      if (totalRepos === 0) {
        totalRepos = repoData.totalCount;
        // Try to get accurate counts from separate queries
        const publicReposCountFromQuery = data.data.user.publicRepositories?.totalCount || 0;
        const privateReposCountFromQuery = data.data.user.privateRepositories?.totalCount || 0;
        
        // If we got separate counts, use them (more accurate)
        if (privateReposCountFromQuery > 0 || publicReposCountFromQuery > 0) {
          logger.info({ 
            username, 
            totalRepos,
            publicReposFromQuery: publicReposCountFromQuery,
            privateReposFromQuery: privateReposCountFromQuery
          }, 'Got separate public/private repo counts from API');
        }
      }
      
      allRepositories = allRepositories.concat(repoData.nodes);
      hasNextPage = repoData.pageInfo.hasNextPage;
      cursor = repoData.pageInfo.endCursor;
    }
    
    // Calculate statistics from all repositories
    const publicRepos = allRepositories.filter(repo => !repo.isPrivate && !repo.isFork);
    const forks = allRepositories.filter(repo => repo.isFork);
    
    // Count public repos and forks from fetched data
    const publicReposCount = publicRepos.length;
    const forksCount = forks.length;
    
    // Use API counts if available (from privacy filter queries), otherwise calculate
    let privateReposCount;
    let finalPublicReposCount;
    
    if (isOwnAccount && (privateReposCountFromAPI > 0 || publicReposCountFromAPI > 0)) {
      // Use API-provided counts (most accurate for own account)
      finalPublicReposCount = publicReposCountFromAPI;
      privateReposCount = privateReposCountFromAPI;
      logger.info({ 
        username, 
        isOwnAccount: true,
        totalRepos, 
        fetchedRepos: allRepositories.length,
        publicReposCount: finalPublicReposCount, 
        privateReposCount, 
        forksCount,
        usingAPICounts: true
      }, 'Repository statistics calculated using API counts');
    } else {
      // For other users or if API counts failed, calculate from fetched data
      finalPublicReposCount = publicReposCount;
      // Calculate private repos: total - public - forks
      privateReposCount = Math.max(0, totalRepos - publicReposCount - forksCount);
      
      logger.info({ 
        username, 
        isOwnAccount: false,
        totalRepos, 
        fetchedRepos: allRepositories.length,
        publicReposCount: finalPublicReposCount, 
        privateReposCount, 
        forksCount,
        note: 'Private repos may not be visible when querying other users'
      }, 'Repository statistics calculated');
    }
    
    const totalStars = allRepositories.reduce((sum, repo) => sum + repo.stargazerCount, 0);
    const totalForks = allRepositories.reduce((sum, repo) => sum + repo.forkCount, 0);
    
    // Find most starred repository
    const mostStarredRepo = allRepositories.length > 0 
      ? allRepositories.reduce((max, repo) => 
          repo.stargazerCount > max.stargazerCount ? repo : max
        )
      : null;

    return {
      totalRepos,
      publicRepos: finalPublicReposCount,
      privateRepos: privateReposCount,
      forks: forksCount,
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

