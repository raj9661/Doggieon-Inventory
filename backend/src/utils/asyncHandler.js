/**
 * Async handler to avoid try-catch blocks in controllers
 * @param {Function} fn - Async function
 * @returns {Function} - Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = asyncHandler
