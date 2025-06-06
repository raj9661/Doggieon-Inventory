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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search as SearchIcon, Edit as EditIcon, Trash2 } from "lucide-react"

interface Donor {
  id: string
  name: string
  email: string
  phone?: string
  type: string
  createdAt: string
  _count: { donations: number }
}

export default function DonorManagement() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null)
  const [newDonor, setNewDonor] = useState({
    name: "",
    email: "",
    phone: "",
    type: "CUSTOM_AMOUNT",
  })

  useEffect(() => {
    fetchDonors()
  }, [searchTerm])

  const fetchDonors = async () => {
    try {
      const response = await fetch(`/api/donors?search=${searchTerm}`, {
        credentials: "include",
      })
      const data = await response.json()
      setDonors(data.donors || [])
    } catch (error) {
      console.error("Failed to fetch donors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDonor = async () => {
    try {
      const response = await fetch("/api/donors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newDonor),
      })

      if (response.ok) {
        setIsAddDialogOpen(false)
        setNewDonor({ name: "", email: "", phone: "", type: "CUSTOM_AMOUNT" })
        fetchDonors()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to add donor")
      }
    } catch (error) {
      console.error("Failed to add donor:", error)
      alert("Failed to add donor")
    }
  }

  const handleEditDonor = async () => {
    if (!selectedDonor) return

    try {
      const response = await fetch(`/api/donors/${selectedDonor.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: selectedDonor.name,
          email: selectedDonor.email,
          phone: selectedDonor.phone,
          type: selectedDonor.type,
        }),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setSelectedDonor(null)
        fetchDonors()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update donor")
      }
    } catch (error) {
      console.error("Failed to update donor:", error)
      alert("Failed to update donor")
    }
  }

  const handleDeleteDonor = async () => {
    if (!selectedDonor) return

    try {
      const response = await fetch(`/api/donors/${selectedDonor.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setSelectedDonor(null)
        fetchDonors()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete donor")
      }
    } catch (error) {
      console.error("Failed to delete donor:", error)
      alert("Failed to delete donor")
    }
  }

  const getDonorTypeColor = (type: string) => {
    switch (type) {
      case "FOOD_AND_NUTRITION":
        return "bg-green-100 text-green-800"
      case "MEDICAL_CARE":
        return "bg-blue-100 text-blue-800"
      case "SHELTER_AND_HOUSING":
        return "bg-purple-100 text-purple-800"
      case "WINTER_CARE":
        return "bg-orange-100 text-orange-800"
      case "EMERGENCY_FUND":
        return "bg-red-100 text-red-800"
      case "CUSTOM_AMOUNT":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Donor Management</CardTitle>
            <CardDescription>Manage your donor database</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Donor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Donor</DialogTitle>
                <DialogDescription>Enter donor information below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newDonor.name}
                    onChange={(e) => setNewDonor({ ...newDonor, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newDonor.email}
                    onChange={(e) => setNewDonor({ ...newDonor, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newDonor.phone}
                    onChange={(e) => setNewDonor({ ...newDonor, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Donor Type</Label>
                  <Select value={newDonor.type} onValueChange={(value) => setNewDonor({ ...newDonor, type: value })}>
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
                <Button onClick={handleAddDonor} className="w-full">
                  Add Donor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search donors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Donations</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donors.map((donor) => (
              <TableRow key={donor.id}>
                <TableCell className="font-medium">{donor.name}</TableCell>
                <TableCell>{donor.email}</TableCell>
                <TableCell>
                  <Badge className={getDonorTypeColor(donor.type)}>{donor.type}</Badge>
                </TableCell>
                <TableCell>{donor._count?.donations || 0}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDonor(donor)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        setSelectedDonor(donor)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Donor Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Donor</DialogTitle>
              <DialogDescription>Update donor information</DialogDescription>
            </DialogHeader>
            {selectedDonor && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedDonor.name}
                    onChange={(e) => setSelectedDonor({ ...selectedDonor, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedDonor.email}
                    onChange={(e) => setSelectedDonor({ ...selectedDonor, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={selectedDonor.phone || ""}
                    onChange={(e) => setSelectedDonor({ ...selectedDonor, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Donor Type</Label>
                  <Select
                    value={selectedDonor.type}
                    onValueChange={(value) => setSelectedDonor({ ...selectedDonor, type: value })}
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
                <Button onClick={handleEditDonor} className="w-full">
                  Update Donor
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Donor Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the donor
                {selectedDonor && ` "${selectedDonor.name}"`} and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteDonor} className="bg-red-500 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
