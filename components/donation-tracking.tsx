"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, TrendingUp } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Cookies from "js-cookie"

interface Donation {
  id: string
  amount?: number
  type: string
  description?: string
  date: string
  donor: {
    id: string
    name: string
    email: string
  }
}

interface Donor {
  id: string
  name: string
  email: string
}

export default function DonationTracking() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [donors, setDonors] = useState<Donor[]>([])
  const [topDonors, setTopDonors] = useState<{ id: string; name: string; totalAmount: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [period, setPeriod] = useState("month")
  const [stats, setStats] = useState({ totalAmount: 0, totalCount: 0 })
  const [newDonation, setNewDonation] = useState({
    donorId: "",
    amount: 0,
    type: "MONEY",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchDonations()
    fetchDonors()
    fetchTopDonors()
  }, [period])

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/donations?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setDonations(data.donations || [])
      setStats(data.stats || { totalAmount: 0, totalCount: 0 })
    } catch (error) {
      console.error("Failed to fetch donations:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const fetchTopDonors = async () => {
    try {
      const token = Cookies.get("token")
      const response = await fetch(`/api/donors/top?period=${period}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setTopDonors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch top donors:", error)
      setTopDonors([])
    }
  }

  const handleAddDonation = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDonation),
      })

      if (response.ok) {
        setIsAddDialogOpen(false)
        setNewDonation({
          donorId: "",
          amount: 0,
          type: "MONEY",
          description: "",
          date: new Date().toISOString().split("T")[0],
        })
        fetchDonations()
        fetchTopDonors()
      }
    } catch (error) {
      console.error("Failed to add donation:", error)
    }
  }

  const getDonationTypeColor = (type: string) => {
    switch (type) {
      case "MONEY":
        return "bg-green-100 text-green-800"
      case "FOOD":
        return "bg-blue-100 text-blue-800"
      case "PRODUCT":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCount} donations this {period}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Period Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Record Donation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Donation</DialogTitle>
                  <DialogDescription>Add a new donation to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="donor">Donor</Label>
                    <Select
                      value={newDonation.donorId}
                      onValueChange={(value) => setNewDonation({ ...newDonation, donorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select donor" />
                      </SelectTrigger>
                      <SelectContent>
                        {donors.map((donor) => (
                          <SelectItem key={donor.id} value={donor.id}>
                            {donor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Donation Type</Label>
                    <Select
                      value={newDonation.type}
                      onValueChange={(value) => setNewDonation({ ...newDonation, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOOD_AND_NUTRITION">Food and Nutrition</SelectItem>
                        <SelectItem value="MEDICAL_CARE">Medical Care</SelectItem>
                        <SelectItem value="SHELTER_AND_HOUSING">Shelter and Housing</SelectItem>
                        <SelectItem value="WINTER_CARE">Winter Care</SelectItem>
                        <SelectItem value="EMERGENCY_FUND">Emergency Fund</SelectItem>
                        <SelectItem value="CUSTOM_AMOUNT">Custom Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newDonation.amount}
                      onChange={(e) =>
                        setNewDonation({ ...newDonation, amount: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newDonation.date}
                      onChange={(e) => setNewDonation({ ...newDonation, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newDonation.description}
                      onChange={(e) => setNewDonation({ ...newDonation, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <Button onClick={handleAddDonation} className="w-full">
                    Record Donation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Top Donors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Donors</CardTitle>
          <CardDescription>Most generous donors this {period}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topDonors.length > 0 ? (
              topDonors.map((donor, index) => (
                <div key={donor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{donor.name}</div>
                      <div className="text-sm text-muted-foreground">{formatCurrency(donor.totalAmount)}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">No donation data available</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Latest donations for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">{donation.donor.name}</TableCell>
                  <TableCell>
                    <Badge className={getDonationTypeColor(donation.type)}>{donation.type}</Badge>
                  </TableCell>
                  <TableCell>{donation.amount ? formatCurrency(donation.amount) : "-"}</TableCell>
                  <TableCell>{formatDate(new Date(donation.date))}</TableCell>
                  <TableCell>{donation.description || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
