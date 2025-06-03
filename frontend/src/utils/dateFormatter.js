import { format, formatDistanceToNow } from "date-fns"

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} - Formatted date
 */
export function formatDate(date, formatStr = "MMM d, yyyy") {
  if (!date) return ""
  return format(new Date(date), formatStr)
}

/**
 * Format date relative to now
 * @param {Date|string} date - Date to format
 * @param {Object} options - Options
 * @returns {string} - Formatted date
 */
export function formatRelativeDate(date, options = {}) {
  if (!date) return ""
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    ...options,
  })
}
