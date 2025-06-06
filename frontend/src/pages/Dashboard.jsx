"use client"

import { motion } from "framer-motion"
import DashboardStats from "../components/dashboard/DashboardStats"
import TopDonorsChart from "../components/dashboard/TopDonorsChart"
import LowStockAlert from "../components/dashboard/LowStockAlert"
import RecentDonations from "../components/dashboard/RecentDonations"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the NGO Management System dashboard</p>
      </motion.div>

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopDonorsChart />
        <LowStockAlert />
      </div>

      <RecentDonations />
    </div>
  )
}
