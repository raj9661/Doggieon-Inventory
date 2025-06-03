import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names with Tailwind CSS
 * @param  {...any} inputs - Class names
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
