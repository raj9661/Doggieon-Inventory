import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyTokenEdge } from "./lib/auth"

// Use the same secret key as in auth library
const JWT_SECRET = "ngo-management-secret-key-2024"

// Add paths that don't require authentication
const publicPaths = ["/login", "/api/auth/login"]

export function middleware(request: NextRequest) {
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
  }

  // If no token and trying to access protected route, redirect to login
  if (!token && !pathname.startsWith("/api/")) {
    console.log("No token, redirecting to login")
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  // If token exists, verify it using edge-compatible verification
  if (token) {
    console.log("Attempting to verify token...")
    const decoded = verifyTokenEdge(token)
    console.log("Token verification result:", decoded ? "valid" : "invalid")
    
    if (decoded) {
      console.log("Token payload:", {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : "no expiry",
      })
    }
    
    // If token is invalid and trying to access protected route, redirect to login
    if (!decoded && !pathname.startsWith("/api/")) {
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
  }

  console.log("Middleware allowing access to:", pathname)
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/login (login API route)
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. /favicon.ico, /site.webmanifest (static files)
     */
    "/((?!api/auth/login|_next|fonts|favicon.ico|site.webmanifest).*)",
  ],
} 