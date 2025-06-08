import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

interface Donation {
  amount: number | null
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the first day of current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Get current date for end of month
    const now = new Date()

    console.log("Date range:", { startOfMonth, now })

    // Run queries in parallel
    const [totalDonors, monthlyDonations, lowStockItems] = await Promise.all([
      // Get total donors count
      prisma.donor.count(),

      // Get monthly donations
      prisma.donation.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: now,
          },
        },
        select: {
          amount: true,
        },
      }),

      // Get low stock items count
      prisma.inventoryItem.count({
        where: {
          quantity: {
            lte: prisma.inventoryItem.fields.lowStockThreshold,
          },
        },
      }),
    ])

    // Calculate donation totals
    const totalDonations = monthlyDonations.reduce((sum: number, donation: Donation) => sum + (donation.amount || 0), 0)
    const totalDonationCount = monthlyDonations.length

    console.log("Query results:", {
      totalDonors,
      monthlyDonations,
      totalDonations,
      totalDonationCount,
      lowStockItems,
    })

    return NextResponse.json({
      totalDonors,
      totalDonations,
      totalDonationCount,
      lowStockItems,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
} 