const { createClient } = require("redis");
require("dotenv").config();
const username = process.env.REDIS_USERNAME;
const password = process.env.REDIS_PASSWORD;
const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;
const client = createClient({
  username: username,
  password: password,
  socket: {
    host: host,
    port: port,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.log("Redis: Too many retries, stopping reconnect");
        return new Error("Redis max retries reached");
      }
      return Math.min(retries * 200, 3000);
    },
  },
});

let isRedisReady = false;

client.on("error", (err) => {
  isRedisReady = false;
  console.log("Redis Client Error:", err.message);
});
client.on("connect", () => console.log("✅ Connected to Redis"));
client.on("ready", () => {
  isRedisReady = true;
  console.log("✅ Redis is ready");
});
client.on("end", () => {
  isRedisReady = false;
  console.log("Redis connection closed");
});

client.connect().catch((err) => {
  console.error("Redis initial connection failed:", err.message);
});

// ── Cache helper utilities ────────────────────────────────────────────────────

/**
 * Get from cache or execute the fallback function and cache the result.
 * If Redis is down, just run the fallback directly — no crash.
 * @param {string} key    - Redis key
 * @param {number} ttl    - Time-to-live in seconds
 * @param {Function} fn   - Async function to call on cache miss
 * @returns {any}         - Parsed result
 */
async function cacheOrFetch(key, ttl, fn) {
  // If Redis isn't ready, skip caching entirely
  if (!isRedisReady) {
    return await fn();
  }

  try {
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error("Redis GET error:", err.message);
  }

  // Cache miss → execute the function
  const result = await fn();

  try {
    if (isRedisReady) {
      await client.setEx(key, ttl, JSON.stringify(result));
    }
  } catch (err) {
    console.error("Redis SETEX error:", err.message);
  }

  return result;
}

/**
 * Invalidate one or more cache keys (supports glob patterns).
 * Silently does nothing if Redis is not connected.
 * @param  {...string} patterns - Key(s) or patterns to delete
 */
async function invalidateCache(...patterns) {
  if (!isRedisReady) return;

  // Filter out any falsy, non-string, or empty patterns upfront
  const validPatterns = patterns.filter(
    (p) => typeof p === "string" && p.trim() !== ""
  );

  if (validPatterns.length === 0) return;

  try {
    for (const pattern of validPatterns) {
      if (pattern.includes("*")) {
        // redis v5 scanIterator yields arrays (chunks) of keys, not individual strings
        for await (const chunk of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
          const keys = Array.isArray(chunk) ? chunk : [chunk];
          for (const key of keys) {
            if (typeof key === "string" && key.trim()) {
              await client.del(key);
            }
          }
        }
      } else {
        await client.del(pattern);
      }
    }
  } catch (err) {
    console.error("Redis invalidation error:", err.message);
  }
}

module.exports = { client, cacheOrFetch, invalidateCache };
