const { Redis } = require("@upstash/redis")
const NodeCache = require("node-cache")

// Fallback to in-memory cache if Redis is not available
const localCache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 1 minute
})

let redis

try {
  // Initialize Redis client with Upstash
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
} catch (error) {
  console.error("Failed to connect to Redis, falling back to in-memory cache:", error)
}

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
async function getCache(key) {
  try {
    if (redis) {
      return await redis.get(key)
    }
    return localCache.get(key)
  } catch (error) {
    console.error("Cache get error:", error)
    return null
  }
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - Success status
 */
async function setCache(key, value, ttl = 300) {
  try {
    if (redis) {
      await redis.set(key, value, { ex: ttl })
    } else {
      localCache.set(key, value, ttl)
    }
    return true
  } catch (error) {
    console.error("Cache set error:", error)
    return false
  }
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
async function deleteCache(key) {
  try {
    if (redis) {
      await redis.del(key)
    } else {
      localCache.del(key)
    }
    return true
  } catch (error) {
    console.error("Cache delete error:", error)
    return false
  }
}

/**
 * Clear cache with pattern
 * @param {string} pattern - Key pattern to clear
 * @returns {Promise<boolean>} - Success status
 */
async function clearCachePattern(pattern) {
  try {
    if (redis) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } else {
      // For local cache, we need to iterate through all keys
      const keys = localCache.keys()
      const matchingKeys = keys.filter((key) => key.includes(pattern))
      matchingKeys.forEach((key) => localCache.del(key))
    }
    return true
  } catch (error) {
    console.error("Cache clear pattern error:", error)
    return false
  }
}

module.exports = {
  redis,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
}
