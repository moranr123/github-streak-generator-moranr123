import axios from "axios";

export const fetchGitHubData = async (username) => {
  // GitHub REST API v3 for contributions is limited, GraphQL is better
  // Example: Fetch user events
  const url = `https://api.github.com/users/${username}/events/public`;

  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "GitHub-Streak-App",
      "Authorization": `token ${process.env.GITHUB_TOKEN}`, // optional
    },
  });

  // Map data to daily contributions (simplified example)
  const contributions = data.map((event) => ({
    date: event.created_at,
    count: 1, // for each event
  }));

  return contributions;
};
