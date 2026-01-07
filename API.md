# API Documentation

## Base URL

```
http://localhost:5000/api/streak
```

For production, replace with your production URL.

## Authentication

No authentication required. All endpoints are publicly accessible.

## Rate Limits

All endpoints are rate-limited per IP address:

- **General API endpoints**: 100 requests per 15 minutes
- **Card generation endpoints**: 30 requests per 15 minutes
- **Cache management endpoints**: 10 requests per 15 minutes

When rate limit is exceeded, the API returns a `429 Too Many Requests` status with an error message.

## Endpoints

### 1. Health Check

Check the health status of the API service.

**Endpoint:** `GET /api/streak/health`

**Rate Limit:** None (unlimited)

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "dependencies": {
    "cache": {
      "enabled": true,
      "status": "enabled"
    },
    "github": {
      "status": "configured"
    }
  }
}
```

**Status Codes:**
- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service is degraded (e.g., GitHub token not configured)

---

### 2. Get Streak Data (JSON)

Get GitHub contribution streak data for a user in JSON format.

**Endpoint:** `GET /api/streak/:username`

**Rate Limit:** 100 requests per 15 minutes

**Path Parameters:**
- `username` (required): GitHub username (1-39 characters, alphanumeric and hyphens)

**Response:**

```json
{
  "username": "octocat",
  "current": 5,
  "longest": 30,
  "total": 365
}
```

**Response Fields:**
- `username`: The GitHub username
- `current`: Current contribution streak (days)
- `longest`: Longest contribution streak (days)
- `total`: Total contributions (days)

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid username format
- `404 Not Found`: User not found
- `403 Forbidden`: GitHub API rate limit exceeded
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Example:**

```bash
curl http://localhost:5000/api/streak/octocat
```

---

### 3. Generate Streak Card (PNG)

Generate a PNG image card showing GitHub contribution streak statistics.

**Endpoint:** `GET /api/streak/card/:username`

**Rate Limit:** 30 requests per 15 minutes

**Path Parameters:**
- `username` (required): GitHub username (1-39 characters, alphanumeric and hyphens)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `statType` | string | `streak` | Type of statistics to display. Options: `streak`, `top_languages`, `repository_stats` |
| `theme` | string | `ffffff` | Hex color code (without #) for the card theme. Example: `ff6b6b` |
| `fontSize` | string | `normal` | Font size. Options: `small`, `normal`, `large` |
| `hideAvatar` | boolean | `false` | Hide user avatar. Set to `true` to hide |
| `cardWidth` | number | `600` | Card width in pixels (400-2000) |
| `cardHeight` | number | `200` | Card height in pixels (200-1200) |
| `displaySections` | string | `total,current,longest` | Comma-separated list of sections to display. Only for `statType=streak`. Options: `total`, `current`, `longest` |

**Response:**

Returns a PNG image with the following headers:
- `Content-Type: image/png`
- `Cache-Control: no-cache, no-store, must-revalidate`
- CORS headers (if origin is provided)

**Status Codes:**
- `200 OK`: Success (returns PNG image)
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: User not found
- `403 Forbidden`: GitHub API rate limit exceeded
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Examples:**

**Basic streak card:**
```bash
curl http://localhost:5000/api/streak/card/octocat -o streak.png
```

**Customized streak card:**
```bash
curl "http://localhost:5000/api/streak/card/octocat?theme=ff6b6b&fontSize=large&cardWidth=800&cardHeight=250" -o streak.png
```

**Top languages card:**
```bash
curl "http://localhost:5000/api/streak/card/octocat?statType=top_languages&theme=4ecdc4" -o languages.png
```

**Repository stats card:**
```bash
curl "http://localhost:5000/api/streak/card/octocat?statType=repository_stats&theme=95e1d3" -o repos.png
```

**Streak card with custom sections:**
```bash
curl "http://localhost:5000/api/streak/card/octocat?displaySections=current,longest&hideAvatar=true" -o streak.png
```

**HTML Image Tag:**
```html
<img src="http://localhost:5000/api/streak/card/octocat?theme=ff6b6b" alt="GitHub Streak" />
```

**Markdown:**
```markdown
![GitHub Streak](http://localhost:5000/api/streak/card/octocat?theme=ff6b6b)
```

---

### 4. Get Cache Statistics

Get cache statistics and performance metrics.

**Endpoint:** `GET /api/streak/cache/stats`

**Rate Limit:** 10 requests per 15 minutes

**Response:**

```json
{
  "cache": {
    "enabled": true,
    "hits": 150,
    "misses": 50,
    "hitRate": 0.75,
    "totalRequests": 200,
    "keys": 25
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Response Fields:**
- `cache.enabled`: Whether caching is enabled
- `cache.hits`: Number of cache hits
- `cache.misses`: Number of cache misses
- `cache.hitRate`: Cache hit rate (0-1)
- `cache.totalRequests`: Total cache requests
- `cache.keys`: Number of cached keys

**Status Codes:**
- `200 OK`: Success
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Example:**

```bash
curl http://localhost:5000/api/streak/cache/stats
```

---

### 5. Clear Cache

Clear cache for a specific user or reset cache statistics.

**Endpoint:** `DELETE /api/streak/cache`

**Rate Limit:** 10 requests per 15 minutes

**Query Parameters:**
- `username` (optional): GitHub username to clear cache for. If not provided, resets cache statistics only.

**Response:**

**Clear specific user cache:**
```json
{
  "message": "Cache cleared for user: octocat",
  "deleted": 1
}
```

**Reset all cache statistics:**
```json
{
  "message": "Cache statistics reset. Note: Upstash Redis keys persist until TTL expires.",
  "note": "To clear specific keys, use ?username=username query parameter"
}
```

**Status Codes:**
- `200 OK`: Success
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Examples:**

**Clear cache for specific user:**
```bash
curl -X DELETE "http://localhost:5000/api/streak/cache?username=octocat"
```

**Reset cache statistics:**
```bash
curl -X DELETE http://localhost:5000/api/streak/cache
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request parameters or validation failed
- `403 Forbidden`: GitHub API rate limit exceeded
- `404 Not Found`: User not found or resource doesn't exist
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Validation Rules

### Username Validation

- Must be 1-39 characters long
- Can contain alphanumeric characters and hyphens
- Cannot start or end with a hyphen
- Cannot contain consecutive hyphens
- Username is automatically converted to lowercase

### Card Parameters Validation

- `statType`: Must be one of: `streak`, `top_languages`, `repository_stats`
- `theme`: Must be a valid 6-character hex color code (without #)
- `fontSize`: Must be one of: `small`, `normal`, `large`
- `hideAvatar`: Must be `true` or `false` (string)
- `cardWidth`: Must be a number between 400 and 2000
- `cardHeight`: Must be a number between 200 and 1200
- `displaySections`: Comma-separated list of valid sections: `total`, `current`, `longest`

---

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for image endpoints. The following origins are allowed:

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`
- Origins specified in `FRONTEND_URL` or `CORS_ORIGIN` environment variables
- All origins in development mode

---

## Response Headers

### Rate Limit Headers

When rate limiting is enabled, the following headers are included:

- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining in the current window
- `RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

### Cache Headers (Image Endpoints)

- `Content-Type: image/png`
- `Cache-Control: no-cache, no-store, must-revalidate`
- `Pragma: no-cache`
- `Expires: 0`

### CORS Headers (Image Endpoints)

- `Access-Control-Allow-Origin: <origin>` (if origin is provided)
- `Access-Control-Allow-Credentials: true`

---

## Examples

### JavaScript (Fetch API)

```javascript
// Get streak data
const response = await fetch('http://localhost:5000/api/streak/octocat');
const data = await response.json();
console.log(data);

// Generate streak card
const cardUrl = 'http://localhost:5000/api/streak/card/octocat?theme=ff6b6b&fontSize=large';
const img = document.createElement('img');
img.src = cardUrl;
document.body.appendChild(img);
```

### Python

```python
import requests

# Get streak data
response = requests.get('http://localhost:5000/api/streak/octocat')
data = response.json()
print(data)

# Generate streak card
card_url = 'http://localhost:5000/api/streak/card/octocat?theme=ff6b6b'
response = requests.get(card_url)
with open('streak.png', 'wb') as f:
    f.write(response.content)
```

### Node.js (Axios)

```javascript
const axios = require('axios');

// Get streak data
const response = await axios.get('http://localhost:5000/api/streak/octocat');
console.log(response.data);

// Generate streak card
const cardResponse = await axios.get(
  'http://localhost:5000/api/streak/card/octocat',
  { 
    params: { theme: 'ff6b6b', fontSize: 'large' },
    responseType: 'arraybuffer'
  }
);
require('fs').writeFileSync('streak.png', cardResponse.data);
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Image cards are generated dynamically and are not cached
- JSON API responses may be cached based on cache configuration
- Usernames are case-insensitive (automatically converted to lowercase)
- The API uses GitHub's public API, which has its own rate limits
- Card generation is resource-intensive and has stricter rate limits
