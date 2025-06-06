import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    console.log("Token received in API:", token ? "Present" : "Missing")

    if (!token) {
      console.error("No token provided in request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    console.log("Token verification result:", decoded ? "Valid" : "Invalid")

    if (!decoded) {
      console.error("Invalid token provided")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const lowStock = searchParams.get("lowStock") === "true"
    const forSale = searchParams.get("forSale") === "true"

    console.log("Query params:", { category, lowStock, forSale })

    const where: any = {}

    if (category) where.category = category
    if (lowStock) {
      where.quantity = { lte: prisma.inventoryItem.fields.lowStockThreshold }
    }
    if (forSale) where.isForSale = true

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { name: "asc" },
    })

    console.log(`Found ${items.length} inventory items`)

    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        quantity: { lte: 10 }, // Default threshold
      },
    })

    return NextResponse.json({
      items,
      lowStockCount: lowStockItems.length,
      lowStockItems,
    })
  } catch (error) {
    console.error("Error in inventory API:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      console.error("No token provided in request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.error("Invalid token provided")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const item = await prisma.inventoryItem.create({
      data: {
        name: data.name,
        category: data.category,
        quantity: data.quantity || 0,
        lowStockThreshold: data.lowStockThreshold || 10,
        isForSale: data.isForSale || false,
        price: data.price,
        description: data.description,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 })
  }
}
