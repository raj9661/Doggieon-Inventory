import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

// Function to fetch data from external donation site
async function fetchExternalDonationData(siteId: string) {
  try {
    // Get the external site configuration
    const site = await prisma.externalSite.findUnique({
      where: { id: siteId }
    })

    if (!site) {
      throw new Error("External site not found")
    }

    if (!site.isActive) {
      throw new Error("External site is not active")
    }

    // Construct the full URL
    const url = new URL(site.apiEndpoint, site.baseUrl).toString()

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${site.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }

    // Update last sync timestamp
    await prisma.externalSite.update({
      where: { id: siteId },
      data: { lastSync: new Date() }
    })

    return await response.json()
  } catch (error) {
    console.error('Error fetching external data:', error)
    throw error
  }
}

// Function to sync a donor
async function syncDonor(donorData: any) {
  try {
    // Check if donor already exists
    const existingDonor = await prisma.donor.findUnique({
      where: { email: donorData.email }
    })

    if (existingDonor) {
      // Update existing donor
      return await prisma.donor.update({
        where: { id: existingDonor.id },
        data: {
          name: donorData.name,
          phone: donorData.phone,
          type: donorData.type || 'CUSTOM_AMOUNT',
          isActive: true
        }
      })
    } else {
      // Create new donor
      return await prisma.donor.create({
        data: {
          name: donorData.name,
          email: donorData.email,
          phone: donorData.phone,
          type: donorData.type || 'CUSTOM_AMOUNT'
        }
      })
    }
  } catch (error) {
    console.error('Error syncing donor:', error)
    throw error
  }
}

// Function to sync a donation
async function syncDonation(donationData: any, donorId: string) {
  try {
    // Check if donation already exists (you might want to use a different identifier)
    const existingDonation = await prisma.donation.findFirst({
      where: {
        donorId: donorId,
        date: new Date(donationData.date),
        amount: donationData.amount
      }
    })

    if (!existingDonation) {
      // Create new donation
      return await prisma.donation.create({
        data: {
          donorId: donorId,
          amount: donationData.amount,
          type: donationData.type,
          description: donationData.description,
          date: new Date(donationData.date)
        }
      })
    }

    return existingDonation
  } catch (error) {
    console.error('Error syncing donation:', error)
    throw error
  }
}

// POST /api/sync - Trigger a sync with the external donation site
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the site ID from the request body
    const { siteId } = await request.json()
    if (!siteId) {
      return NextResponse.json({ error: "Site ID is required" }, { status: 400 })
    }

    // Verify the site belongs to the admin
    const site = await prisma.externalSite.findFirst({
      where: {
        id: siteId,
        adminId: decoded.id
      }
    })

    if (!site) {
      return NextResponse.json({ error: "External site not found" }, { status: 404 })
    }

    // Fetch data from external site
    const externalData = await fetchExternalDonationData(siteId)
    
    // Process and sync the data
    const syncResults = {
      donors: { created: 0, updated: 0 },
      donations: { created: 0, skipped: 0 },
      errors: [] as string[]
    }

    // Process each donor and their donations
    for (const donorData of externalData.donors) {
      try {
        const donor = await syncDonor(donorData)
        if (donorData.donations) {
          for (const donationData of donorData.donations) {
            try {
              const donation = await syncDonation(donationData, donor.id)
              if (donation) {
                syncResults.donations.created++
              } else {
                syncResults.donations.skipped++
              }
            } catch (error: any) {
              syncResults.errors.push(`Error syncing donation for donor ${donor.email}: ${error?.message || 'Unknown error'}`)
            }
          }
        }
        if (donor.createdAt === donor.updatedAt) {
          syncResults.donors.created++
        } else {
          syncResults.donors.updated++
        }
      } catch (error: any) {
        syncResults.errors.push(`Error syncing donor ${donorData.email}: ${error?.message || 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: "Sync completed",
      site: {
        name: site.name,
        baseUrl: site.baseUrl
      },
      results: syncResults
    })

  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json({ 
      error: "Failed to sync data",
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/sync/status - Get the status of the last sync
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all external sites with their last sync status
    const sites = await prisma.externalSite.findMany({
      where: { adminId: decoded.id },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        apiEndpoint: true,
        isActive: true,
        lastSync: true
      },
      orderBy: {
        lastSync: 'desc'
      }
    })

    if (sites.length === 0) {
      return NextResponse.json({ 
        status: "No external sites configured"
      })
    }

    return NextResponse.json({
      status: "Sync status for all sites",
      sites: sites.map(site => ({
        id: site.id,
        name: site.name,
        baseUrl: site.baseUrl,
        apiEndpoint: site.apiEndpoint,
        isActive: site.isActive,
        lastSync: site.lastSync
      }))
    })

  } catch (error: any) {
    console.error('Error getting sync status:', error)
    return NextResponse.json({ 
      error: "Failed to get sync status",
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
} 