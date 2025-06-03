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
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function AdminActions() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove("token")
    router.push("/login")
  }

  const handleChangePassword = async () => {
    try {
      setError("")

      // Validate passwords
      if (passwords.newPassword !== passwords.confirmPassword) {
        setError("New passwords do not match")
        return
      }

      if (passwords.newPassword.length < 6) {
        setError("New password must be at least 6 characters long")
        return
      }

      const token = Cookies.get("token")
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
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
            <Button onClick={handleChangePassword} className="w-full">
              Change Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="destructive" size="sm" onClick={handleLogout}>
        <LogOutIcon className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  )
} 