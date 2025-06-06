import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

// GET /api/external-sites - List all external sites
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sites = await prisma.externalSite.findMany({
      where: { adminId: decoded.id },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        apiEndpoint: true,
        isActive: true,
        lastSync: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ sites })
  } catch (error: any) {
    console.error("Error fetching external sites:", error)
    return NextResponse.json({ 
      error: "Failed to fetch external sites",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
}

// POST /api/external-sites - Create a new external site
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, baseUrl, apiEndpoint, apiKey } = await request.json()

    // Validate required fields
    if (!name || !baseUrl || !apiEndpoint || !apiKey) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: "Name, base URL, API endpoint, and API key are required"
      }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(baseUrl)
    } catch (error) {
      return NextResponse.json({ 
        error: "Invalid base URL",
        details: "Please provide a valid URL including the protocol (http:// or https://)"
      }, { status: 400 })
    }

    // Create the external site
    const site = await prisma.externalSite.create({
      data: {
        name,
        baseUrl,
        apiEndpoint,
        apiKey,
        adminId: decoded.id
      }
    })

    return NextResponse.json({
      message: "External site created successfully",
      site: {
        id: site.id,
        name: site.name,
        baseUrl: site.baseUrl,
        apiEndpoint: site.apiEndpoint,
        isActive: site.isActive,
        lastSync: site.lastSync
      }
    })
  } catch (error: any) {
    console.error("Error creating external site:", error)
    return NextResponse.json({ 
      error: "Failed to create external site",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
} 