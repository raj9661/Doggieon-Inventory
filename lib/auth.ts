import type { NextRequest } from "next/server"
import { Buffer } from 'buffer'

// Use a more reliable secret key
const JWT_SECRET = process.env.JWT_SECRET || "ngo-management-secret-key-2024"

export interface TokenPayload {
  id: string
  username?: string
  role?: string
  iat?: number
  exp?: number
}

// Helper to get a crypto key for HMAC
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyData = enc.encode(JWT_SECRET)
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

// Generate a token (works in both Edge and Node.js)
export async function generateToken(adminId: string): Promise<string> {
  const payload = {
    id: adminId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  }
  const payloadStr = JSON.stringify(payload)
  const payloadBase64 = btoa(payloadStr)
  
  // Use Node.js crypto in Node.js environment, Web Crypto API in Edge
  if (typeof process !== 'undefined' && process.versions?.node) {
    const crypto = await import('crypto')
    const hmac = crypto.createHmac('sha256', JWT_SECRET)
    hmac.update(payloadBase64)
    return `${payloadBase64}.${hmac.digest('hex')}`
  } else {
    const key = await getCryptoKey()
    const sigBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payloadBase64)
    )
    const signature = Buffer.from(new Uint8Array(sigBuf)).toString('hex')
    return `${payloadBase64}.${signature}`
  }
}

// Verify a token (works in both Edge and Node.js)
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const [payloadBase64, signature] = token.split('.')
    if (!payloadBase64 || !signature) return null

    // Use Node.js crypto in Node.js environment, Web Crypto API in Edge
    if (typeof process !== 'undefined' && process.versions?.node) {
      const crypto = await import('crypto')
      const hmac = crypto.createHmac('sha256', JWT_SECRET)
      hmac.update(payloadBase64)
      const expectedSignature = hmac.digest('hex')
      if (signature !== expectedSignature) return null
    } else {
      const key = await getCryptoKey()
      const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        Buffer.from(signature, 'hex'),
        new TextEncoder().encode(payloadBase64)
      )
      if (!valid) return null
    }

    const payloadStr = atob(payloadBase64)
    const payload = JSON.parse(payloadStr) as TokenPayload
    if (!payload.id) return null
    if (payload.exp && payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}

// For middleware, just use verifyToken
export const verifyTokenEdge = verifyToken

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  
  // Try to get token from cookie
  const cookieHeader = request.headers.get("cookie")
  if (cookieHeader) {
    const cookies = cookieHeader.split(";")
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith("token="))
    if (tokenCookie) {
      // Decode the URL-encoded token
      const encodedToken = tokenCookie.split("=")[1]
      try {
        return decodeURIComponent(encodedToken)
      } catch {
        // If decoding fails, return the original token
        return encodedToken
      }
    }
  }
  
  return null
}

// Hash password using crypto with salt
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const data = encoder.encode(password)
  
  // Combine salt and password
  const combined = new Uint8Array(salt.length + data.length)
  combined.set(salt)
  combined.set(data, salt.length)
  
  // Hash the combined data
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
  
  // Combine salt and hash for storage
  const hashArray = new Uint8Array(hashBuffer)
  const result = new Uint8Array(salt.length + hashArray.length)
  result.set(salt)
  result.set(hashArray, salt.length)
  
  return Buffer.from(result).toString('base64')
}

// Compare passwords using crypto with salt
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const storedData = Buffer.from(hashedPassword, 'base64')
    
    // Extract salt and hash from stored data
    const salt = storedData.slice(0, 16)
    const storedHash = storedData.slice(16)
    
    // Hash the input password with the same salt
    const passwordData = encoder.encode(plainPassword)
    const combined = new Uint8Array(salt.length + passwordData.length)
    combined.set(salt)
    combined.set(passwordData, salt.length)
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
    const hashArray = new Uint8Array(hashBuffer)
    
    // Compare hashes
    if (hashArray.length !== storedHash.length) return false
    
    let result = 0
    for (let i = 0; i < hashArray.length; i++) {
      result |= hashArray[i] ^ storedHash[i]
    }
    return result === 0
  } catch {
    return false
  }
}
