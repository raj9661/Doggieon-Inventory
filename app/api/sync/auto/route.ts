import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// This endpoint is for automatic syncing via cron job
// It doesn't require authentication since it will be called by a scheduled task
export async function GET() {
  try {
    // Get all active external sites
    const sites = await prisma.externalSite.findMany({
      where: { isActive: true }
    })

    const results = {
      totalSites: sites.length,
      successful: 0,
      failed: 0,
      details: [] as any[]
    }

    // Sync each site
    for (const site of sites) {
      try {
        // Construct the full URL
        const url = new URL(site.apiEndpoint, site.baseUrl).toString()

        // Fetch data from external site
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${site.apiKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }

        const externalData = await response.json()
        
        // Process and sync the data
        const syncResults = {
          donors: { created: 0, updated: 0 },
          donations: { created: 0, skipped: 0 },
          errors: [] as string[]
        }

        // Process each donor and their donations
        for (const donorData of externalData.donors) {
          try {
            // Check if donor already exists
            const existingDonor = await prisma.donor.findUnique({
              where: { email: donorData.email }
            })

            let donor
            if (existingDonor) {
              // Update existing donor
              donor = await prisma.donor.update({
                where: { id: existingDonor.id },
                data: {
                  name: donorData.name,
                  phone: donorData.phone,
                  type: donorData.type || 'CUSTOM_AMOUNT',
                  isActive: true
                }
              })
              syncResults.donors.updated++
            } else {
              // Create new donor
              donor = await prisma.donor.create({
                data: {
                  name: donorData.name,
                  email: donorData.email,
                  phone: donorData.phone,
                  type: donorData.type || 'CUSTOM_AMOUNT'
                }
              })
              syncResults.donors.created++
            }

            // Process donations if any
            if (donorData.donations) {
              for (const donationData of donorData.donations) {
                try {
                  // Check if donation already exists
                  const existingDonation = await prisma.donation.findFirst({
                    where: {
                      donorId: donor.id,
                      date: new Date(donationData.date),
                      amount: donationData.amount
                    }
                  })

                  if (!existingDonation) {
                    await prisma.donation.create({
                      data: {
                        donorId: donor.id,
                        amount: donationData.amount,
                        type: donationData.type,
                        description: donationData.description,
                        date: new Date(donationData.date)
                      }
                    })
                    syncResults.donations.created++
                  } else {
                    syncResults.donations.skipped++
                  }
                } catch (error: any) {
                  syncResults.errors.push(`Error syncing donation for donor ${donor.email}: ${error?.message || 'Unknown error'}`)
                }
              }
            }
          } catch (error: any) {
            syncResults.errors.push(`Error syncing donor ${donorData.email}: ${error?.message || 'Unknown error'}`)
          }
        }

        // Update last sync timestamp
        await prisma.externalSite.update({
          where: { id: site.id },
          data: { lastSync: new Date() }
        })

        results.successful++
        results.details.push({
          site: site.name,
          status: 'success',
          results: syncResults
        })
      } catch (error: any) {
        results.failed++
        results.details.push({
          site: site.name,
          status: 'error',
          error: error?.message || 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: "Automatic sync completed",
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error: any) {
    console.error('Auto sync error:', error)
    return NextResponse.json({ 
      error: "Failed to perform automatic sync",
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
} 