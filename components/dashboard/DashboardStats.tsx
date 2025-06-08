'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, AlertTriangle, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useQuery } from "@/hooks/use-query"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  totalDonors: number
  totalDonations: number
  totalDonationCount: number
  lowStockItems: number
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    url: '/api/dashboard/stats',
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.subtext && (
              <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 