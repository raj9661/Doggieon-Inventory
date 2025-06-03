import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { comparePasswords, generateToken } from "@/lib/auth"

// Basic route handler
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    // Find admin by username
    const admin = await prisma.admin.findFirst({
      where: { username },
    })

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await comparePasswords(password, admin.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token with admin ID
    const token = await generateToken(admin.id)

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    })

    // Set HTTP-only cookie using NextResponse cookies API
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
