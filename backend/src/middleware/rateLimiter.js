const rateLimit = require("express-rate-limit")

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} - Rate limiter middleware
 */
function createRateLimiter(options = {}) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests, please try again later.",
  }

  return rateLimit({
    ...defaultOptions,
    ...options,
  })
}

// Default rate limiter
const defaultLimiter = createRateLimiter()

// Stricter rate limiter for auth routes
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: "Too many login attempts, please try again later.",
})

// API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // 300 requests per 5 minutes
})

module.exports = {
  defaultLimiter,
  authLimiter,
  apiLimiter,
}
