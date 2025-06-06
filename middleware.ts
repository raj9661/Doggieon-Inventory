import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyTokenEdge } from "./lib/auth"

// Use the same secret key as in auth library
const JWT_SECRET = "ngo-management-secret-key-2024"

// Add paths that don't require authentication
const publicPaths = ["/login", "/api/auth/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log("Middleware processing path:", pathname)

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    console.log("Public path, allowing access")
    return NextResponse.next()
  }

  // Check for token in cookies
  const token = request.cookies.get("token")?.value
  console.log("Token from cookie:", token ? "exists" : "not found")
  
  if (token) {
    console.log("Token value (first 10 chars):", token.substring(0, 10) + "...")
    console.log("Full cookie header:", request.headers.get("cookie"))
  }

  // For API routes, return 401 if no token or invalid token
  if (pathname.startsWith("/api/")) {
    if (!token) {
      console.log("No token for API route, returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const decoded = await verifyTokenEdge(token)
      if (!decoded) {
        console.log("Invalid token for API route, returning 401")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } catch (error) {
      console.error("Error verifying token for API route:", error)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Token is valid for API route, continue
    return NextResponse.next()
  }

  // For non-API routes without token, redirect to login
  if (!token) {
    console.log("No token, redirecting to login")
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  // If token exists, verify it
  try {
    const decoded = await verifyTokenEdge(token)
    console.log("Token verification result:", decoded ? "valid" : "invalid")
    
    if (decoded) {
      console.log("Token payload:", {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : "no expiry",
      })
    } else {
      console.log("Token verification failed")
    }
    
    // If token is invalid, redirect to login
    if (!decoded) {
      console.log("Invalid token, redirecting to login")
      const url = new URL("/login", request.url)
      return NextResponse.redirect(url)
    }

    // If on login page with valid token, redirect to dashboard
    if (decoded && pathname === "/login") {
      console.log("Valid token on login page, redirecting to dashboard")
      const url = new URL("/dashboard", request.url)
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("Error verifying token:", error)
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  console.log("Middleware allowing access to:", pathname)
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /fonts (inside /public)
     * 3. /favicon.ico, /site.webmanifest (static files)
     */
    "/((?!_next|fonts|favicon.ico|site.webmanifest).*)",
  ],
} 