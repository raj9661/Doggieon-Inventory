"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertTriangle, CircleCheck } from "lucide-react"
import { Label } from "@/components/ui/label"

interface ExternalSite {
  id: string
  name: string
  baseUrl: string
  apiEndpoint: string
  isActive: boolean
  lastSync: string | null
}

interface SyncStatus {
  status: string
  sites?: ExternalSite[]
}

interface SyncResults {
  message: string
  site: {
    name: string
    baseUrl: string
  }
  results: {
    donors: {
      created: number
      updated: number
    }
    donations: {
      created: number
      skipped: number
    }
    errors: string[]
  }
}

export default function SyncManagement() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSiteId, setSelectedSiteId] = useState<string>("")

  useEffect(() => {
    fetchSyncStatus()
  }, [])

  const fetchSyncStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/sync", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setSyncStatus(data)
      setError(null)
    } catch (error: any) {
      setError(error?.message || "Failed to fetch sync status")
    }
  }

  const triggerSync = async () => {
    if (!selectedSiteId) {
      setError("Please select a site to sync with")
      return
    }

    setIsSyncing(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          siteId: selectedSiteId
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to sync data")
      }

      setSyncResults(data)
      await fetchSyncStatus() // Refresh status after sync
    } catch (error: any) {
      setError(error?.message || "Failed to sync data")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sync with Donation Sites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-4 flex-1">
                <div>
                  <Label htmlFor="siteSelect">Select Site to Sync</Label>
                  <select
                    id="siteSelect"
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                  >
                    <option value="">Select a site...</option>
                    {syncStatus?.sites?.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.baseUrl})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSiteId && syncStatus?.sites && (
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      const site = syncStatus.sites.find(s => s.id === selectedSiteId)
                      if (!site) return null
                      return (
                        <>
                          <p>Last synced: {site.lastSync ? new Date(site.lastSync).toLocaleString() : "Never"}</p>
                          <p>Status: <span className={site.isActive ? "text-green-600" : "text-red-600"}>
                            {site.isActive ? "Active" : "Inactive"}
                          </span></p>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>

              <Button
                onClick={triggerSync}
                disabled={isSyncing || !selectedSiteId}
                className="flex items-center gap-2 ml-4"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>

            {syncResults && (
              <Alert className="mt-4">
                <CircleCheck className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Sync Results for {syncResults.site.name}:</div>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>Donors: {syncResults.results.donors.created} created, {syncResults.results.donors.updated} updated</li>
                    <li>Donations: {syncResults.results.donations.created} created, {syncResults.results.donations.skipped} skipped</li>
                    {syncResults.results.errors.length > 0 && (
                      <li className="text-red-500">
                        Errors: {syncResults.results.errors.length}
                        <ul className="ml-4 list-disc">
                          {syncResults.results.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 