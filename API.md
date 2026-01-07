# GitHub Streak Generator API Documentation

## Base URL

```
http://localhost:5000/api/streak
```

For production, replace with your production API URL.

## Authentication

No authentication required. However, a GitHub Personal Access Token must be configured on the server side to access GitHub's API.

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API endpoints**: 100 requests per 15 minutes per IP
- **Card generation endpoints**: 30 requests per 15 minutes per IP
- **Cache management endpoints**: 10 requests per 15 minutes per IP

Rate limit information is included in response headers:
- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining in current window
- `RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

When rate limit is exceeded, the API returns:
- **Status Code**: `429 Too Many Requests`
- **Response Body**: `{ "error": "Too many requests from this IP, please try again later." }`

## Endpoints

### 1. Health Check

Check if the API is running and healthy.

**Endpoint**: `GET /health`

**Rate Limit**: None (for monitoring purposes)

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example Request**:
```bash
curl http://localhost:5000/api/streak/health
```

---

### 2. Get Streak Data (JSON)

Retrieve GitHub contribution streak data for a user in JSON format.

**Endpoint**: `GET /:username`

**Rate Limit**: 100 requests per 15 minutes per IP

**Path Parameters**:
- `username` (required): GitHub username

**Response**:
```json
{
  "username": "octocat",
  "current": 5,
  "longest": 10,
  "total": 150
}
```

**Response Fields**:
- `username` (string): GitHub username
- `current` (number): Current contribution streak in days
- `longest` (number): Longest contribution streak in days
- `total` (number): Total number of contributions

**Example Request**:
```bash
curl http://localhost:5000/api/streak/octocat
```

**Error Responses**:
- `404 Not Found`: User not found
  ```json
  { "error": "User not found" }
  ```
- `403 Forbidden`: GitHub API rate limit exceeded
  ```json
  { "error": "Rate limit exceeded" }
  ```
- `429 Too Many Requests`: API rate limit exceeded
  ```json
  { "error": "Too many requests from this IP, please try again later." }
  ```
- `500 Internal Server Error`: Server error
  ```json
  { "error": "Failed to fetch streak data" }
  ```

---

### 3. Generate Streak Card (Image)

Generate a visual contribution streak card as an image.

**Endpoint**: `GET /card/:username`

**Rate Limit**: 30 requests per 15 minutes per IP

**Path Parameters**:
- `username` (required): GitHub username

**Query Parameters**:
- `statType` (optional): Type of statistics to display
  - `streak` (default): Contribution streak
  - `top_languages`: Top programming languages
  - `repository_stats`: Repository statistics
- `theme` (optional): Theme color in hex format (without `#`)
  - Default: `1e1b4b` (dark purple)
  - Examples: `ffffff` (white), `000000` (black), `0366d6` (blue)
- `fontSize` (optional): Font size for the card
  - `small`: Smaller font size
  - `normal` (default): Normal font size
  - `large`: Larger font size
- `hideAvatar` (optional): Hide profile image
  - `true`: Hide avatar
  - `false` (default): Show avatar
- `cardWidth` (optional): Card width in pixels
  - Minimum: `400`
  - Maximum: `2000`
  - Default: `600`
- `cardHeight` (optional): Card height in pixels
  - Minimum: `200`
  - Maximum: `1200`
  - Default: `200`
- `displaySections` (optional): For streak cards only, comma-separated list of sections to display
  - Options: `total`, `current`, `longest`
  - Default: `total,current,longest`
  - Example: `total,current` (hides longest streak)

**Response**: PNG image (binary)

**Content-Type**: `image/png`

**Example Requests**:

Basic request:
```bash
curl http://localhost:5000/api/streak/card/octocat -o card.png
```

With custom theme:
```bash
curl "http://localhost:5000/api/streak/card/octocat?theme=0366d6" -o card.png
```

With all customization options:
```bash
curl "http://localhost:5000/api/streak/card/octocat?statType=top_languages&theme=ffffff&fontSize=large&hideAvatar=false&cardWidth=800&cardHeight=400" -o card.png
```

Repository statistics card:
```bash
curl "http://localhost:5000/api/streak/card/octocat?statType=repository_stats&theme=1e1b4b" -o card.png
```

**Error Responses**:
- `400 Bad Request`: Invalid parameters
  ```json
  { "error": "Invalid cardWidth. Must be between 400 and 2000." }
  ```
- `404 Not Found`: User not found
  ```json
  { "error": "User not found" }
  ```
- `403 Forbidden`: GitHub API rate limit exceeded
  ```json
  { "error": "Rate limit exceeded" }
  ```
- `429 Too Many Requests`: API rate limit exceeded
  ```json
  { "error": "Too many card generation requests from this IP, please try again later." }
  ```
- `500 Internal Server Error`: Server error
  ```json
  { "error": "Failed to generate streak card" }
  ```

---

### 4. Get Cache Statistics

Get statistics about the API cache (if caching is enabled).

**Endpoint**: `GET /cache/stats`

**Rate Limit**: 10 requests per 15 minutes per IP

**Response**:
```json
{
  "hits": 100,
  "misses": 50,
  "size": 25,
  "hitRate": 0.67
}
```

**Response Fields**:
- `hits` (number): Number of cache hits
- `misses` (number): Number of cache misses
- `size` (number): Current cache size
- `hitRate` (number): Cache hit rate (0-1)

**Example Request**:
```bash
curl http://localhost:5000/api/streak/cache/stats
```

---

### 5. Clear Cache

Clear the API cache (if caching is enabled).

**Endpoint**: `DELETE /cache`

**Rate Limit**: 10 requests per 15 minutes per IP

**Response**:
```json
{
  "message": "Cache cleared successfully"
}
```

**Example Request**:
```bash
curl -X DELETE http://localhost:5000/api/streak/cache
```

---

## Stat Types

### Streak (`statType=streak`)

Displays contribution streak information:
- Total contributions
- Current streak
- Longest streak

**Display Sections** (optional):
- `total`: Total contributions count
- `current`: Current streak days
- `longest`: Longest streak days

### Languages (`statType=top_languages`)

Displays top programming languages used by the user:
- Shows up to 3 most used languages
- Displays language name and percentage

### Repository Statistics (`statType=repository_stats`)

Displays repository statistics:
- Total repositories
- Public repositories
- Private repositories
- Total forks
- Total stars
- Total forks received
- Most starred repository (if available)

**Note**: Private repository counts require:
- The GitHub token to have `repo` scope
- Querying your own account (authenticated user)

---

## Themes

The API supports custom themes using hex color codes (without `#`). Some popular themes:

- `1e1b4b` - Dark purple (default)
- `ffffff` - White/light theme
- `000000` - Black theme
- `0366d6` - GitHub blue
- `24292e` - GitHub dark
- `f97316` - Orange
- `ec4899` - Pink/magenta

The theme color is used as the base for generating a color scheme:
- **Light themes** (white/very light colors): White background with dark text
- **Dark themes**: Dark background with light text, using the theme color as accent

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message here"
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request parameters
- `403 Forbidden`: GitHub API rate limit exceeded
- `404 Not Found`: User not found or resource doesn't exist
- `429 Too Many Requests`: API rate limit exceeded
- `500 Internal Server Error`: Server-side error

---

## Usage Examples

### JavaScript/Node.js

```javascript
// Get streak data
const response = await fetch('http://localhost:5000/api/streak/octocat');
const data = await response.json();
console.log(data);

// Generate card
const cardUrl = 'http://localhost:5000/api/streak/card/octocat?theme=0366d6&cardWidth=800';
const cardResponse = await fetch(cardUrl);
const blob = await cardResponse.blob();
const imageUrl = URL.createObjectURL(blob);
```

### Python

```python
import requests

# Get streak data
response = requests.get('http://localhost:5000/api/streak/octocat')
data = response.json()
print(data)

# Generate card
card_url = 'http://localhost:5000/api/streak/card/octocat?theme=0366d6&cardWidth=800'
card_response = requests.get(card_url)
with open('card.png', 'wb') as f:
    f.write(card_response.content)
```

### HTML/Image Tag

```html
<img src="http://localhost:5000/api/streak/card/octocat?theme=0366d6" alt="GitHub Streak Card" />
```

### Markdown

```markdown
![GitHub Streak Card](http://localhost:5000/api/streak/card/octocat?theme=0366d6)
```

---

## Best Practices

1. **Respect Rate Limits**: Implement exponential backoff when receiving 429 responses
2. **Cache Responses**: Cache generated cards client-side to reduce API calls
3. **Handle Errors**: Always handle error responses appropriately
4. **Use Appropriate Stat Types**: Choose the stat type that best fits your use case
5. **Optimize Card Size**: Use appropriate card dimensions for your use case to reduce bandwidth
6. **Monitor Health**: Use the health endpoint for monitoring API availability

---

## Support

For issues, questions, or contributions, please refer to the main README.md file or open an issue on the repository.
