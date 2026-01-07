# How to Verify Redis Cache is Working

## 1. Check Server Startup Logs

When you start the server, look for one of these messages:

**✅ Cache Working:**
```
Redis cache manager initialized successfully
```

**❌ Cache Not Working:**
```
Redis URL or token not found in environment variables. Caching disabled.
```
or
```
Failed to initialize Redis cache
```

## 2. Check Cache Statistics Endpoint

### Request:
```bash
curl http://localhost:5000/api/streak/cache/stats
```

### Expected Response (Cache Enabled):
```json
{
  "cache": {
    "enabled": true,
    "hits": 0,
    "misses": 0,
    "sets": 0,
    "deletes": 0,
    "hitRate": 0,
    "total": 0
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Response (Cache Disabled):
```json
{
  "cache": {
    "enabled": false,
    "hits": 0,
    "misses": 0,
    "sets": 0,
    "deletes": 0,
    "hitRate": 0,
    "total": 0
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 3. Test Cache with Real Requests

### Step 1: Make First Request (Cache Miss)
```bash
# First request - will fetch from GitHub API and cache
curl http://localhost:5000/api/streak/octocat
```

**Check stats after first request:**
```bash
curl http://localhost:5000/api/streak/cache/stats
```

Expected:
- `misses: 1` (first request)
- `sets: 1` (data was cached)
- `hits: 0`

### Step 2: Make Second Request (Cache Hit)
```bash
# Second request - should use cache
curl http://localhost:5000/api/streak/octocat
```

**Check stats after second request:**
```bash
curl http://localhost:5000/api/streak/cache/stats
```

Expected:
- `misses: 1` (unchanged)
- `sets: 1` (unchanged)
- `hits: 1` (cache hit!)
- `hitRate: 0.5` (1 hit out of 2 requests)

### Step 3: Verify Response Time

Cached requests should be **significantly faster** than uncached requests:

```bash
# Time the first request (cache miss - slower)
time curl http://localhost:5000/api/streak/octocat

# Time the second request (cache hit - faster)
time curl http://localhost:5000/api/streak/octocat
```

## 4. Check Server Logs

Look for these log messages:

**Cache Hit:**
```
GitHub data retrieved from cache
```

**Cache Miss (then set):**
```
GitHub data cached
```

## 5. Test Cache Clearing

### Clear specific user cache:
```bash
curl -X DELETE "http://localhost:5000/api/streak/cache?username=octocat"
```

### Reset cache statistics:
```bash
curl -X DELETE http://localhost:5000/api/streak/cache
```

## 6. Verify Environment Variables

Make sure your `.env` file has:
```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
```

## Quick Test Script

Save this as `test-cache.sh`:

```bash
#!/bin/bash

echo "=== Testing Cache ==="
echo ""

echo "1. Checking cache status..."
curl -s http://localhost:5000/api/streak/cache/stats | jq '.cache.enabled'
echo ""

echo "2. Making first request (should cache)..."
time curl -s http://localhost:5000/api/streak/octocat > /dev/null
echo ""

echo "3. Checking cache stats after first request..."
curl -s http://localhost:5000/api/streak/cache/stats | jq '.cache'
echo ""

echo "4. Making second request (should use cache)..."
time curl -s http://localhost:5000/api/streak/octocat > /dev/null
echo ""

echo "5. Checking cache stats after second request..."
curl -s http://localhost:5000/api/streak/cache/stats | jq '.cache'
echo ""

echo "=== Test Complete ==="
```

Run with:
```bash
chmod +x test-cache.sh
./test-cache.sh
```

## Troubleshooting

### Cache shows `enabled: false`
- Check that `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in `.env`
- Restart the server after adding environment variables
- Check server logs for connection errors

### Cache shows `enabled: true` but no hits
- Make sure you're making requests to the same endpoint
- Check that the cache key matches (username must be the same)
- Wait a moment between requests to ensure cache is set

### Cache hits but data seems stale
- Check TTL settings in `CACHE_TTL` constants
- Clear cache manually: `DELETE /cache?username=username`
- Default TTL is 1 hour (3600 seconds)
