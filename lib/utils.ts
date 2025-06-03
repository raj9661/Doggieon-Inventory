import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDateRange(period: string, customStart?: Date, customEnd?: Date) {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case "week":
      const weekStart = new Date(startOfDay)
      weekStart.setDate(startOfDay.getDate() - 7)
      return { start: weekStart, end: now }

    case "month":
      const monthStart = new Date(startOfDay)
      monthStart.setMonth(startOfDay.getMonth() - 1)
      return { start: monthStart, end: now }

    case "90days":
      const ninetyDaysStart = new Date(startOfDay)
      ninetyDaysStart.setDate(startOfDay.getDate() - 90)
      return { start: ninetyDaysStart, end: now }

    case "custom":
      return {
        start: customStart || startOfDay,
        end: customEnd || now,
      }

    default:
      return { start: startOfDay, end: now }
  }
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}
