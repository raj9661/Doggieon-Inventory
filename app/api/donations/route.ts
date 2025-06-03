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
    const donorId = searchParams.get("donorId")

    const { start, end } = getDateRange(period)

    const where: any = {
      date: {
        gte: start,
        lte: end,
      },
    }

    if (donorId) {
      where.donorId = donorId
    }

    const donations = await prisma.donation.findMany({
      where,
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: "desc" },
    })

    const stats = await prisma.donation.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    })

    return NextResponse.json({
      donations,
      stats: {
        totalAmount: stats._sum.amount || 0,
        totalCount: stats._count,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const donation = await prisma.donation.create({
      data: {
        donorId: data.donorId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        donor: true,
      },
    })

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 })
  }
}
