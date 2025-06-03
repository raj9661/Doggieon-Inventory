import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"
import crypto from "crypto"

// Use the same secret key as in auth library
const JWT_SECRET = "ngo-management-secret-key-2024"

// Generate a secure API key
function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

// GET /api/keys - List all API keys
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
    // Get all API keys for this admin
    const apiKeys = await prisma.apiKey.findMany({
      where: { adminId: decoded.id },
      select: {
        id: true,
        name: true,
        key: true,
        createdAt: true,
        lastUsed: true
      }
    })
    return NextResponse.json(apiKeys)
  } catch (error: any) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ 
      error: "Failed to fetch API keys",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
}

// POST /api/keys - Create a new API key
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
    const { name } = await request.json()
    // Generate a new API key
    const apiKey = generateApiKey()
    // Create the API key in the database
    const newApiKey = await prisma.apiKey.create({
      data: {
        name,
        key: apiKey,
        adminId: decoded.id
      },
      select: {
        id: true,
        name: true,
        key: true,
        createdAt: true
      }
    })
    return NextResponse.json(newApiKey)
  } catch (error: any) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ 
      error: "Failed to create API key",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
} 