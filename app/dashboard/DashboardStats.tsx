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
      icon: <Users className="h-5 w-5 text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      title: "Monthly Donations",
      value: formatCurrency(stats?.totalDonations || 0),
      subtext: `${stats?.totalDonationCount || 0} donations this month`,
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      color: "bg-green-50",
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockItems || 0,
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      color: "bg-orange-50",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full p-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {statCards.map((card, index) => (
        <Card 
          key={index} 
          className={`w-full ${card.color} border-none shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6">
            <CardTitle className="text-base font-semibold text-gray-700">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold tracking-tight text-gray-900">{card.value}</div>
            {card.subtext && (
              <p className="text-sm text-gray-600 mt-2">{card.subtext}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 