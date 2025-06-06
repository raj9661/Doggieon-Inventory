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
import { Switch } from "@/components/ui/switch"
import { PlusCircle, AlertTriangle } from "lucide-react"

// Helper function to get cookie
function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return undefined
}

// Helper function to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  lowStockThreshold: number
  isForSale: boolean
  price?: number
  description?: string
}

export default function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 0,
    lowStockThreshold: 10,
    isForSale: false,
    price: 0,
    description: "",
  })

  useEffect(() => {
    fetchInventory()
  }, [filter])

  const fetchInventory = async () => {
    try {
      let url = "/api/inventory"
      if (filter === "lowStock") url += "?lowStock=true"
      if (filter === "forSale") url += "?forSale=true"

      console.log("Fetching inventory from:", url) // Debug log
      
      const response = await fetch(url, {
        credentials: "include", // Important: This sends the cookie
        headers: { 
          "Content-Type": "application/json"
        },
      })
      
      if (response.status === 401) {
        console.error("Token invalid or expired - redirecting to login")
        window.location.href = "/login"
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Inventory data:", data)
      setItems(data.items || [])
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        credentials: "include", // Important: This sends the cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Added item:", data) // Debug log
      
      setIsAddDialogOpen(false)
      setNewItem({
        name: "",
        category: "",
        quantity: 0,
        lowStockThreshold: 10,
        isForSale: false,
        price: 0,
        description: "",
      })
      fetchInventory()
    } catch (error) {
      console.error("Failed to add item:", error)
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.lowStockThreshold) {
      return <Badge variant="destructive">Low Stock</Badge>
    }
    if (item.quantity === 0) {
      return <Badge variant="outline">Out of Stock</Badge>
    }
    return <Badge variant="secondary">In Stock</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>Track and manage your inventory items</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>Enter item details below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dog Food">Dog Food</SelectItem>
                      <SelectItem value="Cat Food">Cat Food</SelectItem>
                      <SelectItem value="Toys">Toys</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="threshold">Low Stock Threshold</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={newItem.lowStockThreshold}
                      onChange={(e) =>
                        setNewItem({ ...newItem, lowStockThreshold: Number.parseInt(e.target.value) || 10 })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="forSale"
                    checked={newItem.isForSale}
                    onCheckedChange={(checked) => setNewItem({ ...newItem, isForSale: checked })}
                  />
                  <Label htmlFor="forSale">Available for Sale</Label>
                </div>
                {newItem.isForSale && (
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddItem} className="w-full">
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="lowStock">Low Stock</SelectItem>
              <SelectItem value="forSale">For Sale</SelectItem>
            </SelectContent>
          </Select>
          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {loading ? "Loading inventory..." : "No items found"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>For Sale</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {item.quantity <= item.lowStockThreshold && (
                        <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                      )}
                      {item.quantity}
                    </div>
                  </TableCell>
                  <TableCell>{getStockStatus(item)}</TableCell>
                  <TableCell>{item.isForSale ? "Yes" : "No"}</TableCell>
                  <TableCell>{item.isForSale ? `$${item.price?.toFixed(2) || "0.00"}` : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
