"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CircleCheck } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExternalSite {
  id: string
  name: string
  baseUrl: string
  apiEndpoint: string
  isActive: boolean
  lastSync: string | null
  autoSync: boolean
  syncInterval: string
}

export default function AutoSyncSettings() {
  const [sites, setSites] = useState<ExternalSite[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/external-sites", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (Array.isArray(data.sites)) {
        setSites(data.sites)
      }
    } catch (error) {
      setError("Failed to fetch external sites")
    }
  }

  const updateSiteSettings = async (siteId: string, settings: { autoSync?: boolean; syncInterval?: string }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/external-sites/${siteId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      setSuccess("Settings updated successfully")
      fetchSites()
    } catch (error) {
      setError("Failed to update settings")
    }
  }

  const triggerManualSync = async (siteId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ siteId }),
      })

      if (!response.ok) {
        throw new Error("Failed to trigger sync")
      }

      setSuccess("Sync triggered successfully")
      fetchSites()
    } catch (error) {
      setError("Failed to trigger sync")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automatic Sync Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sites.map((site) => (
              <div key={site.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{site.name}</h3>
                    <p className="text-sm text-muted-foreground">{site.baseUrl}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={site.autoSync}
                        onCheckedChange={(checked) => 
                          updateSiteSettings(site.id, { autoSync: checked })
                        }
                      />
                      <Label>Auto Sync</Label>
                    </div>
                    {site.autoSync && (
                      <Select
                        value={site.syncInterval}
                        onValueChange={(value) => 
                          updateSiteSettings(site.id, { syncInterval: value })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Every 5 minutes</SelectItem>
                          <SelectItem value="15">Every 15 minutes</SelectItem>
                          <SelectItem value="30">Every 30 minutes</SelectItem>
                          <SelectItem value="60">Every hour</SelectItem>
                          <SelectItem value="360">Every 6 hours</SelectItem>
                          <SelectItem value="720">Every 12 hours</SelectItem>
                          <SelectItem value="1440">Every 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerManualSync(site.id)}
                    >
                      Sync Now
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Last synced: {site.lastSync ? new Date(site.lastSync).toLocaleString() : "Never"}</p>
                </div>
              </div>
            ))}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CircleCheck className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 