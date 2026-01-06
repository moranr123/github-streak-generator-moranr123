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

  const { data } = await axios.post(
    "https://api.github.com/graphql",
    { query },
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;

  // Flatten weeks to daily list
  const days = weeks.flatMap(week =>
    week.contributionDays.map(day => ({
      date: day.date,
      count: day.contributionCount,
    }))
  );

  return days;
};
