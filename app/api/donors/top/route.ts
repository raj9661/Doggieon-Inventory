import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"
import { getDateRange } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const { start, end } = getDateRange(period)

    const topDonors = await prisma.donor.findMany({
      select: {
        id: true,
        name: true,
        donations: {
          where: {
            date: {
              gte: start,
              lte: end,
            },
          },
          select: {
            amount: true,
          },
        },
      },
    })

    const donorsWithTotals = topDonors
      .map((donor) => ({
        id: donor.id,
        name: donor.name,
        totalAmount: donor.donations.reduce((sum, donation) => sum + (donation.amount || 0), 0),
      }))
      .filter((donor) => donor.totalAmount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit)

    return NextResponse.json(donorsWithTotals)
  } catch (error) {
    console.error("Error fetching top donors:", error)
    return NextResponse.json({ error: "Failed to fetch top donors" }, { status: 500 })
  }
}
