"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOutIcon, KeyRoundIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminActions() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    localStorage.removeItem("admin")
    router.push("/login")
  }

  const handleChangePassword = async () => {
    try {
      setError("")
      setIsLoading(true)

      // Validate passwords
      if (passwords.newPassword !== passwords.confirmPassword) {
        setError("New passwords do not match")
        return
      }

      if (passwords.newPassword.length < 6) {
        setError("New password must be at least 6 characters long")
        return
      }

      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This ensures cookies are sent with the request
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          handleLogout()
          return
        }
        throw new Error(data.error || "Failed to change password")
      }

      // Clear form and close dialog
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsChangePasswordOpen(false)
      alert("Password changed successfully")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <KeyRoundIcon className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={handleChangePassword} className="w-full" disabled={isLoading}>
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOutIcon className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  )
} 