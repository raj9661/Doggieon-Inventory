import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

// PATCH /api/donors/[donorId] - Update a donor
export async function PATCH(
  request: NextRequest,
  { params }: { params: { donorId: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("Invalid token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    console.log("Updating donor:", params.donorId, "with data:", data)

    // Check if donor exists
    const existingDonor = await prisma.donor.findUnique({
      where: { id: params.donorId },
    })

    if (!existingDonor) {
      console.log("Donor not found:", params.donorId)
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    // Update donor
    const updatedDonor = await prisma.donor.update({
      where: { id: params.donorId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type,
      },
      include: {
        _count: {
          select: { donations: true },
        },
      },
    })

    console.log("Donor updated successfully:", updatedDonor.id)
    return NextResponse.json(updatedDonor)
  } catch (error) {
    console.error("Error updating donor:", error)
    return NextResponse.json({ error: "Failed to update donor" }, { status: 500 })
  }
}

// DELETE /api/donors/[donorId] - Delete a donor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { donorId: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("Invalid token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if donor exists
    const existingDonor = await prisma.donor.findUnique({
      where: { id: params.donorId },
      include: {
        _count: {
          select: { donations: true },
        },
      },
    })

    if (!existingDonor) {
      console.log("Donor not found:", params.donorId)
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    // Check if donor has donations
    if (existingDonor._count.donations > 0) {
      console.log("Cannot delete donor with existing donations:", params.donorId)
      return NextResponse.json(
        { error: "Cannot delete donor with existing donations" },
        { status: 400 }
      )
    }

    // Delete donor
    await prisma.donor.delete({
      where: { id: params.donorId },
    })

    console.log("Donor deleted successfully:", params.donorId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting donor:", error)
    return NextResponse.json({ error: "Failed to delete donor" }, { status: 500 })
  }
} 