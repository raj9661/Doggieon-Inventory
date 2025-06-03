import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest, comparePasswords, hashPassword } from "@/lib/auth"

// Use the same secret key as in auth library
const JWT_SECRET = "ngo-management-secret-key-2024"

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