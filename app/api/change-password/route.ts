import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest, comparePasswords, hashPassword } from "@/lib/auth"

// Basic route handler
export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    })

    if (!admin) {
      return Response.json({ error: "Admin not found" }, { status: 404 })
    }

    const passwordMatch = await comparePasswords(currentPassword, admin.password)
    if (!passwordMatch) {
      return Response.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(newPassword)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    })

    return Response.json({ message: "Password updated successfully" })
  } catch (error: any) {
    return Response.json({ 
      error: "Failed to change password",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
} 