"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, DollarSign, Package, AlertTriangle, Key, Activity } from "lucide-react"
import { DynamicDashboardStats, DynamicTopDonorsChart } from "@/components/dynamic-imports"
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDonors: 0,
    totalDonations: 0,
    lowStockItems: 0,
    pendingMessages: 0,
    activeApiKeys: 0,
    apiRequestsToday: 0
  })

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="w-full max-w-7xl mx-auto">
        <DynamicDashboardStats />
      </div>
      <Tabs defaultValue="donors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="donors">Donors</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        <TabsContent value="donors">
          <DonorManagement />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>
        <TabsContent value="donations">
          <DonationTracking />
        </TabsContent>
        <TabsContent value="messages">
          <MessageCenter />
        </TabsContent>
        <TabsContent value="api">
          <ApiManagement />
        </TabsContent>
        <TabsContent value="admin">
          <AdminActions />
        </TabsContent>
      </Tabs>
    </div>
  )
}
