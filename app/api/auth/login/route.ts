import { NextRequest } from "next/server"
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
      return Response.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await comparePasswords(password, admin.password)
    if (!passwordMatch) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token with admin ID
    const token = await generateToken(admin.id)

    // Create response with cookie
    const response = Response.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    })

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)

    return response
  } catch (error) {
    return Response.json({ error: "Login failed" }, { status: 500 })
  }
}
