"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart } from "lucide-react"

// Helper function to set cookie
function setCookie(name: string, value: string, days: number) {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/`
}

// Helper function to get cookie
function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return undefined
}

export default function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include", // Important: This allows cookies to be set
      })

      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If JSON parsing fails, try to get the raw text
        const text = await response.text();
        throw new Error(`Login failed: ${text || 'Unknown error'}`);
      }

      // Check if the response was not ok (status not in 200-299 range)
      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Login failed with status: ${response.status}`);
      }

      // At this point we have valid JSON data and a successful response
      if (data.success) {
        // Store admin info in localStorage (not sensitive data)
        localStorage.setItem("admin", JSON.stringify(data.admin))
        
        // Force a hard navigation to dashboard
        window.location.href = "/dashboard"
      } else {
        // This shouldn't happen with the current API, but handle it just in case
        throw new Error(data.error || "Login failed: Unexpected response format")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
      <Card className="w-full max-w-md border border-gray-200 bg-white shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">NGO Management System</CardTitle>
          <CardDescription className="text-gray-600">Sign in to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
                className="border-gray-200 focus:border-black focus:ring-black bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                className="border-gray-200 focus:border-black focus:ring-black bg-white"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-gray-900 text-white transition-colors" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
