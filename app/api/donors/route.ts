import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [donors, total] = await Promise.all([
      prisma.donor.findMany({
        where,
        include: {
          donations: {
            orderBy: { date: "desc" },
            take: 5,
          },
          _count: {
            select: { donations: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.donor.count({ where }),
    ])

    return NextResponse.json({
      donors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch donors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const donor = await prisma.donor.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type || "CUSTOM_AMOUNT",
      },
    })

    return NextResponse.json(donor, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create donor" }, { status: 500 })
  }
}
