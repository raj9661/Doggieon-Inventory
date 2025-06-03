"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, DollarSign, Package, AlertTriangle, Key, Activity } from "lucide-react"
import DonorManagement from "@/components/donor-management"
import InventoryManagement from "@/components/inventory-management"
import DonationTracking from "@/components/donation-tracking"
import MessageCenter from "@/components/message-center"
import ApiManagement from "@/components/api-management"
import AdminActions from "@/components/admin-actions"
import Cookies from "js-cookie"
import SyncManagement from "@/components/sync-management"
import { formatCurrency } from "@/lib/utils"

interface DashboardStats {
  totalDonors: number
  totalDonations: number
  lowStockItems: number
  pendingMessages: number
  activeApiKeys: number
  apiRequestsToday: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDonors: 0,
    totalDonations: 0,
    lowStockItems: 0,
    pendingMessages: 0,
    activeApiKeys: 0,
    apiRequestsToday: 0,
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = Cookies.get("token")

      // Fetch multiple endpoints for dashboard stats
      const [donorsRes, donationsRes, inventoryRes] = await Promise.all([
        fetch("/api/donors", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/donations?period=month", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/inventory?lowStock=true", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const [donorsData, donationsData, inventoryData] = await Promise.all([
        donorsRes.json(),
        donationsRes.json(),
        inventoryRes.json(),
      ])

      setStats({
        totalDonors: donorsData.pagination?.total || 0,
        totalDonations: donationsData.stats?.totalAmount || 0,
        lowStockItems: inventoryData.lowStockCount || 0,
        pendingMessages: 0, // You can implement this
        activeApiKeys: 0, // You can implement this
        apiRequestsToday: 0, // You can implement this
      })
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">NGO Management Dashboard</h1>
          <p className="text-muted-foreground">Manage donors, inventory, and donations</p>
        </div>
        <AdminActions />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalDonations)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMessages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeApiKeys}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.apiRequestsToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="donors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="donors">Donors</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="api">API Management</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="donors">
          <DonorManagement />
        </TabsContent>

        <TabsContent value="donations">
          <DonationTracking />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="messages">
          <MessageCenter />
        </TabsContent>

        <TabsContent value="api">
          <ApiManagement />
        </TabsContent>

        <TabsContent value="sync">
          <SyncManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
