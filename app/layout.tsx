import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { OptimizedImage } from "@/components/ui/optimized-image"
import Providers from "@/components/providers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Doggiedon Inventory",
  description: "Comprehensive inventory and donor management system for Doggiedon",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className} suppressHydrationWarning>
        <div className="fixed top-4 left-4 z-50">
          <OptimizedImage
            src="/logo.png"
            alt="Doggiedon Logo"
            width={32}
            height={32}
            priority
          />
        </div>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
