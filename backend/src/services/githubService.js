import axios from "axios";
import { logger } from "../middleware/logger.js";

export const fetchGitHubData = async (username) => {
  const query = `
    query {
      user(login: "${username}") {
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

  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      { query },
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

    // Return both days and rate limit info
    return { days, rateLimitInfo };
  } catch (err) {
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
      }
    }
    // Generic error for other cases
    const genericError = new Error('Failed to fetch GitHub data');
    genericError.statusCode = 500;
    throw genericError;
  }
};
