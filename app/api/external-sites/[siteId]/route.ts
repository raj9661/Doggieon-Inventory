import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

// DELETE /api/external-sites/[siteId] - Delete an external site
export async function DELETE(
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

    // Delete the site
    await prisma.externalSite.delete({
      where: { id: params.siteId }
    })

    return NextResponse.json({ message: "External site deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting external site:", error)
    return NextResponse.json({ 
      error: "Failed to delete external site",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
} 