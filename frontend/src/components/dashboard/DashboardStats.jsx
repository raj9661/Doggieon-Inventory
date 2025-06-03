"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Users, Package, AlertTriangle, TrendingUp } from "lucide-react"
import { formatCurrency } from "../../utils/currencyFormatter"
import { motion } from "framer-motion"

// Import API services
import api from "../../services/api"

export default function DashboardStats() {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const [donorsRes, donationsRes, inventoryRes] = await Promise.all([
        api.get("/donors?limit=1"),
        api.get("/donations?period=month"),
        api.get("/inventory?lowStock=true"),
      ])

      return {
        totalDonors: donorsRes.data.pagination?.total || 0,
        totalDonations: donationsRes.data.stats?.totalAmount || 0,
        totalDonationCount: donationsRes.data.stats?.totalCount || 0,
        lowStockItems: inventoryRes.data.lowStockCount || 0,
      }
    },
  })

  const statCards = [
    {
      title: "Total Donors",
      value: stats?.totalDonors || 0,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      color: "bg-blue-50",
    },
    {
      title: "Monthly Donations",
      value: formatCurrency(stats?.totalDonations || 0),
      subtext: `${stats?.totalDonationCount || 0} donations this month`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      color: "bg-green-50",
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockItems || 0,
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      color: "bg-orange-50",
    },
    {
      title: "Total Inventory",
      value: "...",
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      color: "bg-purple-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className={card.color}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : card.value}</div>
              {card.subtext && <p className="text-xs text-muted-foreground">{card.subtext}</p>}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
