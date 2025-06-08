import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"
import { redis } from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cacheKey = 'dashboard:stats'
    
    // Try to get from cache
    const cachedStats = await redis.get<string>(cacheKey)
    if (cachedStats) {
      return NextResponse.json(JSON.parse(cachedStats))
    }

    // Get current month's start and end dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Run queries in parallel
    const [totalDonors, monthlyDonations, lowStockItems] = await Promise.all([
      prisma.donor.count(),
      prisma.donation.aggregate({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.inventoryItem.count({
        where: {
          quantity: {
            lte: 10, // Low stock threshold
          },
        },
      }),
    ])

    const stats = {
      totalDonors,
      totalDonations: monthlyDonations._sum.amount || 0,
      totalDonationCount: monthlyDonations._count,
      lowStockItems,
    }

    // Cache the results
    await redis.setex(cacheKey, 300, JSON.stringify(stats)) // 5 minutes expiration

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
} 