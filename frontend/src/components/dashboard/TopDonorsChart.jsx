"use client"

import { useQuery } from "@tanstack/react-query"
import { getTopDonors } from "../../services/donorService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { formatCurrency } from "../../utils/currencyFormatter"
import { motion } from "framer-motion"

export default function TopDonorsChart() {
  const [period, setPeriod] = useState("month")

  // React Query for top donors
  const {
    data: topDonors,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["topDonors", period],
    queryFn: () => getTopDonors({ period, limit: 5 }),
  })

  const handlePeriodChange = (value) => {
    setPeriod(value)
  }

  const getBarWidth = (amount, maxAmount) => {
    return maxAmount > 0 ? (amount / maxAmount) * 100 : 0
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Donors</CardTitle>
          <CardDescription>Loading top donors...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Donors</CardTitle>
          <CardDescription className="text-red-500">Error loading top donors</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const maxAmount = topDonors?.length > 0 ? Math.max(...topDonors.map((donor) => donor.totalAmount)) : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Top Donors</CardTitle>
          <CardDescription>Highest contributing donors</CardDescription>
        </div>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {topDonors?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No donations found for the selected period</div>
        ) : (
          <div className="space-y-4">
            {topDonors?.map((donor, index) => (
              <div key={donor.donorId} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mr-2">
                      {index + 1}
                    </div>
                    <span className="font-medium">{donor.name}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(donor.totalAmount)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getBarWidth(donor.totalAmount, maxAmount)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {donor.donationCount} donation{donor.donationCount !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
