"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Trash2, RefreshCw } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string | null
  permissions: {
    canReadDonors: boolean
    canReadDonations: boolean
    canReadEmails: boolean
  }
}

interface ExternalSite {
  id: string
  name: string
  baseUrl: string
  apiEndpoint: string
  apiKey: string
  isActive: boolean
  lastSync: string | null
}

export default function ApiManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [externalSites, setExternalSites] = useState<ExternalSite[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [showNewKey, setShowNewKey] = useState("")
  const [error, setError] = useState("")
  
  // New state for external site form
  const [newSite, setNewSite] = useState({
    name: "",
    baseUrl: "",
    apiEndpoint: "",
    apiKey: ""
  })

  useEffect(() => {
    fetchApiKeys()
    fetchExternalSites()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/keys", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (Array.isArray(data.keys)) {
        setApiKeys(data.keys)
      } else {
        setApiKeys([])
        setError(data.error || "Failed to fetch API keys")
      }
    } catch (error) {
      setApiKeys([])
      setError("Failed to fetch API keys")
    }
  }

  const generateNewKey = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      })
      const data = await response.json()
      setShowNewKey(data.key)
      setNewKeyName("")
      fetchApiKeys()
    } catch (error) {
      setError("Failed to generate new API key")
    }
  }

  const deleteKey = async (keyId: string) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/keys/${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchApiKeys()
    } catch (error) {
      setError("Failed to delete API key")
    }
  }

  const updatePermissions = async (keyId: string, permissions: ApiKey["permissions"]) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/keys/${keyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions }),
      })
      fetchApiKeys()
    } catch (error) {
      setError("Failed to update permissions")
    }
  }

  const fetchExternalSites = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/external-sites", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (Array.isArray(data.sites)) {
        setExternalSites(data.sites)
      }
    } catch (error) {
      setError("Failed to fetch external sites")
    }
  }

  const addExternalSite = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/external-sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSite),
      })
      
      if (!response.ok) {
        throw new Error("Failed to add external site")
      }
      
      setNewSite({
        name: "",
        baseUrl: "",
        apiEndpoint: "",
        apiKey: ""
      })
      fetchExternalSites()
    } catch (error) {
      setError("Failed to add external site")
    }
  }

  const deleteExternalSite = async (siteId: string) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/external-sites/${siteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchExternalSites()
    } catch (error) {
      setError("Failed to delete external site")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate New API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Donation Website Integration"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateNewKey} disabled={!newKeyName}>
                Generate Key
              </Button>
            </div>
          </div>

          {showNewKey && (
            <Alert className="mt-4">
              <AlertDescription className="flex items-center justify-between">
                <code className="bg-muted px-2 py-1 rounded">{showNewKey}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(showNewKey)
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External Donation Sites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  placeholder="e.g., Main Donation Portal"
                />
              </div>
              <div>
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={newSite.baseUrl}
                  onChange={(e) => setNewSite({ ...newSite, baseUrl: e.target.value })}
                  placeholder="e.g., https://donation-site.com"
                />
              </div>
              <div>
                <Label htmlFor="apiEndpoint">API Endpoint</Label>
                <Input
                  id="apiEndpoint"
                  value={newSite.apiEndpoint}
                  onChange={(e) => setNewSite({ ...newSite, apiEndpoint: e.target.value })}
                  placeholder="e.g., /api/donations"
                />
              </div>
              <div>
                <Label htmlFor="siteApiKey">API Key</Label>
                <Input
                  id="siteApiKey"
                  value={newSite.apiKey}
                  onChange={(e) => setNewSite({ ...newSite, apiKey: e.target.value })}
                  placeholder="Enter the site's API key"
                />
              </div>
            </div>
            <Button 
              onClick={addExternalSite}
              disabled={!newSite.name || !newSite.baseUrl || !newSite.apiEndpoint || !newSite.apiKey}
            >
              Add External Site
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Configured Sites</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Base URL</TableHead>
                  <TableHead>API Endpoint</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {externalSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>{site.name}</TableCell>
                    <TableCell>{site.baseUrl}</TableCell>
                    <TableCell>{site.apiEndpoint}</TableCell>
                    <TableCell>
                      {site.lastSync ? new Date(site.lastSync).toLocaleString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${
                        site.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {site.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => deleteExternalSite(site.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(apiKeys || []).map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.name}</TableCell>
                  <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={key.permissions.canReadDonors}
                          onCheckedChange={(checked) =>
                            updatePermissions(key.id, { ...key.permissions, canReadDonors: checked })
                          }
                        />
                        <Label>Donors</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={key.permissions.canReadDonations}
                          onCheckedChange={(checked) =>
                            updatePermissions(key.id, { ...key.permissions, canReadDonations: checked })
                          }
                        />
                        <Label>Donations</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={key.permissions.canReadEmails}
                          onCheckedChange={(checked) =>
                            updatePermissions(key.id, { ...key.permissions, canReadEmails: checked })
                          }
                        />
                        <Label>Emails</Label>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => deleteKey(key.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 