import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { comparePasswords, hashPassword } from "@/lib/auth"
import { verifyToken } from "@/lib/auth"

// Route segment configuration
export const config = {
  api: {
    bodyParser: true,
  },
}

// Basic route handler
export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token and get admin ID
    const payload = await verifyToken(token)
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    // Find admin by ID
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Verify current password
    const passwordMatch = await comparePasswords(currentPassword, admin.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await prisma.admin.update({
      where: { id: payload.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
} 