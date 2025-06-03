const NodeCache = require("node-cache")

// Initialize cache with default TTL of 5 minutes
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 1 minute
})

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {any} - Cached value or null
 */
function getCache(key) {
  try {
    return cache.get(key)
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
 * @returns {boolean} - Success status
 */
function setCache(key, value, ttl = 300) {
  try {
    return cache.set(key, value, ttl)
  } catch (error) {
    console.error("Cache set error:", error)
    return false
  }
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {boolean} - Success status
 */
function deleteCache(key) {
  try {
    return cache.del(key)
  } catch (error) {
    console.error("Cache delete error:", error)
    return false
  }
}

/**
 * Clear cache with pattern
 * @param {string} pattern - Key pattern to clear
 * @returns {boolean} - Success status
 */
function clearCachePattern(pattern) {
  try {
    const keys = cache.keys()
    const matchingKeys = keys.filter((key) => key.includes(pattern))

    if (matchingKeys.length > 0) {
      cache.del(matchingKeys)
    }

    return true
  } catch (error) {
    console.error("Cache clear pattern error:", error)
    return false
  }
}

/**
 * Flush all cache
 * @returns {boolean} - Success status
 */
function flushCache() {
  try {
    return cache.flushAll()
  } catch (error) {
    console.error("Cache flush error:", error)
    return false
  }
}

module.exports = {
  cache,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
  flushCache,
}
