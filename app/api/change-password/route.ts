import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, comparePasswords, hashPassword } from "@/lib/auth"

// Basic route handler
export async function POST(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get("token")?.value
    
    if (!token) {
      console.log("No token found in cookies")
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token
    const decoded = await verifyToken(token)
    if (!decoded || !decoded.id) {
      console.log("Invalid token:", decoded)
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { currentPassword, newPassword } = await req.json()

    // Find admin by ID
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    })

    if (!admin) {
      console.log("Admin not found for ID:", decoded.id)
      return Response.json({ error: "Admin not found" }, { status: 404 })
    }

    // Verify current password
    const passwordMatch = await comparePasswords(currentPassword, admin.password)
    if (!passwordMatch) {
      console.log("Current password incorrect for admin:", admin.id)
      return Response.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    })

    console.log("Password updated successfully for admin:", admin.id)
    return Response.json({ message: "Password updated successfully" })
  } catch (error: any) {
    console.error("Change password error:", error)
    return Response.json({ 
      error: "Failed to change password",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
} 