"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Send, Mail } from "lucide-react"

interface Donor {
  id: string
  name: string
  email: string
}

export default function MessageCenter() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState("")
  const [messageType, setMessageType] = useState("THANK_YOU")
  const [customSubject, setCustomSubject] = useState("")
  const [customContent, setCustomContent] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/donors", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setDonors(data.donors || [])
    } catch (error) {
      console.error("Failed to fetch donors:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedDonor) return

    setSending(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          donorId: selectedDonor,
          type: messageType,
          customSubject: customSubject || undefined,
          customContent: customContent || undefined,
        }),
      })

      if (response.ok) {
        setIsMessageDialogOpen(false)
        setSelectedDonor("")
        setCustomSubject("")
        setCustomContent("")
        alert("Message sent successfully!")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const sendBulkThankYou = async () => {
    setSending(true)
    try {
      const token = localStorage.getItem("token")

      // Send thank you messages to all donors
      for (const donor of donors) {
        await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            donorId: donor.id,
            type: "THANK_YOU",
          }),
        })
      }

      alert("Bulk thank you messages sent!")
    } catch (error) {
      console.error("Failed to send bulk messages:", error)
      alert("Failed to send bulk messages")
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Message Center</CardTitle>
            <CardDescription>Send messages to donors</CardDescription>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={sendBulkThankYou} disabled={sending}>
              <Mail className="h-4 w-4 mr-2" />
              Bulk Thank You
            </Button>
            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Message to Donor</DialogTitle>
                  <DialogDescription>Choose a donor and message type</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="donor">Select Donor</Label>
                    <Select value={selectedDonor} onValueChange={setSelectedDonor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a donor" />
                      </SelectTrigger>
                      <SelectContent>
                        {donors.map((donor) => (
                          <SelectItem key={donor.id} value={donor.id}>
                            {donor.name} ({donor.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="messageType">Message Type</Label>
                    <Select value={messageType} onValueChange={setMessageType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="THANK_YOU">Thank You</SelectItem>
                        <SelectItem value="REMINDER">Reminder</SelectItem>
                        <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="customSubject">Custom Subject (Optional)</Label>
                    <Input
                      id="customSubject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Leave empty to use default template"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customContent">Custom Message (Optional)</Label>
                    <Textarea
                      id="customContent"
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      placeholder="Leave empty to use default template"
                      rows={6}
                    />
                  </div>

                  <Button onClick={handleSendMessage} className="w-full" disabled={!selectedDonor || sending}>
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Message Center</h3>
          <p className="text-muted-foreground mb-4">
            Send personalized messages to your donors including thank you notes, reminders, and newsletters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                Thank You
              </Badge>
              <p className="text-sm text-muted-foreground">Automated thank you messages</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                Reminders
              </Badge>
              <p className="text-sm text-muted-foreground">Gentle donation reminders</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                Newsletter
              </Badge>
              <p className="text-sm text-muted-foreground">Updates and news</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
