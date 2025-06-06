import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

// PATCH /api/external-sites/[siteId]/settings - Update sync settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the site belongs to the admin
    const site = await prisma.externalSite.findFirst({
      where: {
        id: params.siteId,
        adminId: decoded.id
      }
    })

    if (!site) {
      return NextResponse.json({ error: "External site not found" }, { status: 404 })
    }

    const { autoSync, syncInterval } = await request.json()

    // Validate sync interval if provided
    if (syncInterval) {
      const validIntervals = ["5", "15", "30", "60", "360", "720", "1440"]
      if (!validIntervals.includes(syncInterval)) {
        return NextResponse.json({ 
          error: "Invalid sync interval",
          details: "Sync interval must be one of: 5, 15, 30, 60, 360, 720, 1440 minutes"
        }, { status: 400 })
      }
    }

    // Update the site settings
    const updatedSite = await prisma.externalSite.update({
      where: { id: params.siteId },
      data: {
        ...(typeof autoSync === 'boolean' && { autoSync }),
        ...(syncInterval && { syncInterval })
      }
    }) as any // Type assertion to bypass the type error

    return NextResponse.json({
      message: "Settings updated successfully",
      site: {
        id: updatedSite.id,
        name: updatedSite.name,
        autoSync: updatedSite.autoSync,
        syncInterval: updatedSite.syncInterval
      }
    })
  } catch (error: any) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ 
      error: "Failed to update settings",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
} 