import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

// Use the same secret key as in auth library
const JWT_SECRET = "ngo-management-secret-key-2024"

// DELETE /api/keys/[keyId] - Delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Verify the key belongs to the admin
    const key = await prisma.apiKey.findFirst({
      where: {
        id: params.keyId,
        adminId: decoded.id,
      },
    })
    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }
    await prisma.apiKey.delete({
      where: { id: params.keyId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting API key:", error)
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 })
  }
}

// PATCH /api/keys/[keyId] - Update API key permissions
export async function PATCH(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { permissions } = await request.json()
    if (!permissions) {
      return NextResponse.json({ error: "Permissions are required" }, { status: 400 })
    }
    // Verify the key belongs to the admin
    const key = await prisma.apiKey.findFirst({
      where: {
        id: params.keyId,
        adminId: decoded.id,
      },
    })
    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }
    const updatedKey = await prisma.apiKey.update({
      where: { id: params.keyId },
      data: { permissions },
    })
    return NextResponse.json(updatedKey)
  } catch (error) {
    console.error("Error updating API key:", error)
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 })
  }
} 