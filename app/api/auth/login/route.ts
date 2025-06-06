import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { comparePasswords, generateToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    // Log the received credentials (without password)
    console.log('Login attempt for username:', username)

    if (!username || !password) {
      console.log('Missing credentials')
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Find admin by username
    const admin = await prisma.admin.findFirst({
      where: { username },
    })

    if (!admin) {
      console.log('Admin not found for username:', username)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    console.log('Admin found:', { id: admin.id, username: admin.username })

    // Verify password
    const passwordMatch = await comparePasswords(password, admin.password)
    console.log('Password match result:', passwordMatch)

    if (!passwordMatch) {
      console.log('Password verification failed for username:', username)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Generate token with admin ID
    const token = await generateToken(admin.id)
    console.log('Token generated successfully')

    // Create the response with NextResponse
    const response = NextResponse.json(
      {
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
        },
      },
      { status: 200 }
    )

    // Set cookie using NextResponse
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    console.log('Login successful for username:', username)
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { 
        error: "Login failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 