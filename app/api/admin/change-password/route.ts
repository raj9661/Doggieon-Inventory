import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest, comparePasswords, hashPassword } from "@/lib/auth"

// Configure runtime to use Node.js
export const runtime = 'nodejs'

// Use the same secret key as in auth library
const JWT_SECRET = process.env.JWT_SECRET || "ngo-management-secret-key-2024"

export async function POST(request: NextRequest) {
  try {
    console.log("Change password request received")
    const token = getTokenFromRequest(request)
    console.log("Token from request:", token ? "exists" : "not found")
    console.log("Full cookie header:", request.headers.get("cookie"))
    
    if (!token) {
      console.log("No token found in request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Attempting to verify token...")
    const decoded = await verifyToken(token)
    console.log("Token verification result:", decoded ? "valid" : "invalid")
    
    if (!decoded) {
      console.log("Token verification failed")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Token payload:", {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : "no expiry",
    })

    const { currentPassword, newPassword } = await request.json()

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    // Verify current password
    const passwordMatch = await comparePasswords(currentPassword, admin.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error: any) {
    console.error("Error changing password:", error)
    return NextResponse.json({ 
      error: "Failed to change password",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
} 