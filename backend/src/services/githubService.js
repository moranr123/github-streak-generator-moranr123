import axios from "axios";

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
    const { data } = await axios.post(
      "https://api.github.com/graphql",
      { query },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

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

    return days;
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
