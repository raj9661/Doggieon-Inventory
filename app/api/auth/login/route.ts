import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { comparePasswords } from "@/lib/auth"
import { generateToken } from "@/lib/auth"

// Use the same secret key as in auth library
const JWT_SECRET = "ngo-management-secret-key-2024"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    console.log("Login attempt for username:", username)

    // Find admin by username
    const admin = await prisma.admin.findFirst({
      where: { username },
    })

    if (!admin) {
      console.log("Login failed: Username not found")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await comparePasswords(password, admin.password)
    console.log("Password verification result:", passwordMatch)

    if (!passwordMatch) {
      console.log("Login failed: Invalid password")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token with admin ID
    const token = await generateToken(admin.id)
    console.log("Login successful for user:", admin.username)

    // Create the response
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    console.log("Set HTTP-only cookie in response")
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
