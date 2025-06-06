"use client"

import { NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Users, DollarSign, Package, Mail, LogOut } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../utils/cn"

export default function Sidebar({ open, setOpen }) {
  const { logout } = useAuth()

  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Donors", path: "/donors", icon: <Users className="h-5 w-5" /> },
    { name: "Donations", path: "/donations", icon: <DollarSign className="h-5 w-5" /> },
    { name: "Inventory", path: "/inventory", icon: <Package className="h-5 w-5" /> },
    { name: "Messages", path: "/messages", icon: <Mail className="h-5 w-5" /> },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform md:translate-x-0 md:relative md:z-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">NGO Management</h2>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100 transition-colors",
                    isActive && "bg-blue-50 text-blue-700 font-medium",
                  )
                }
                onClick={() => setOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
