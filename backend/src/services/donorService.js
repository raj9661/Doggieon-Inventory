const { getCache, setCache, deleteCache, clearCachePattern } = require("../config/cache")

/**
 * Donor service with caching and optimized queries
 */
class DonorService {
  constructor(prisma) {
    this.prisma = prisma
    this.cacheKeyPrefix = "donor:"
    this.cacheTTL = 3600 // 1 hour
  }

  /**
   * Get all donors with pagination and search
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Donors and pagination data
   */
  async getDonors({ page = 1, limit = 10, search = "", sortBy = "name", sortOrder = "asc" }) {
    const cacheKey = `${this.cacheKeyPrefix}list:${page}:${limit}:${search}:${sortBy}:${sortOrder}`

    // Try to get from cache first
    const cachedData = getCache(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build search condition
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}

    // Execute query with pagination and sorting
    const [donors, total] = await Promise.all([
      this.prisma.donor.findMany({
        where,
        include: {
          _count: {
            select: { donations: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.donor.count({ where }),
    ])

    const result = {
      donors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    }

    // Cache the result
    setCache(cacheKey, result, this.cacheTTL)

    return result
  }

  /**
   * Get donor by ID
   * @param {string} id - Donor ID
   * @returns {Promise<Object>} - Donor data
   */
  async getDonorById(id) {
    const cacheKey = `${this.cacheKeyPrefix}${id}`

    // Try to get from cache first
    const cachedDonor = getCache(cacheKey)
    if (cachedDonor) {
      return cachedDonor
    }

    // Get donor with donation count and recent donations
    const donor = await this.prisma.donor.findUnique({
      where: { id },
      include: {
        donations: {
          orderBy: { date: "desc" },
          take: 5,
        },
        _count: {
          select: { donations: true },
        },
      },
    })

    if (!donor) {
      return null
    }

    // Cache the result
    setCache(cacheKey, donor, this.cacheTTL)

    return donor
  }

  /**
   * Create new donor
   * @param {Object} data - Donor data
   * @returns {Promise<Object>} - Created donor
   */
  async createDonor(data) {
    const donor = await this.prisma.donor.create({
      data,
    })

    // Clear list cache
    clearCachePattern(`${this.cacheKeyPrefix}list:`)

    return donor
  }

  /**
   * Update donor
   * @param {string} id - Donor ID
   * @param {Object} data - Donor data
   * @returns {Promise<Object>} - Updated donor
   */
  async updateDonor(id, data) {
    const donor = await this.prisma.donor.update({
      where: { id },
      data,
    })

    // Clear specific donor cache and list cache
    deleteCache(`${this.cacheKeyPrefix}${id}`)
    clearCachePattern(`${this.cacheKeyPrefix}list:`)

    return donor
  }

  /**
   * Delete donor
   * @param {string} id - Donor ID
   * @returns {Promise<Object>} - Deleted donor
   */
  async deleteDonor(id) {
    const donor = await this.prisma.donor.delete({
      where: { id },
    })

    // Clear specific donor cache and list cache
    deleteCache(`${this.cacheKeyPrefix}${id}`)
    clearCachePattern(`${this.cacheKeyPrefix}list:`)

    return donor
  }

  /**
   * Get top donors by period
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Top donors
   */
  async getTopDonors({ period = "month", limit = 10 }) {
    const cacheKey = `${this.cacheKeyPrefix}top:${period}:${limit}`

    // Try to get from cache first
    const cachedData = getCache(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate

    switch (period) {
      case "week":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        break
      case "90days":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 90)
        break
      case "year":
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1) // Default to month
    }

    // Use raw SQL for better performance with CockroachDB
    // This query uses the B-Tree indexes on donorId and date
    const topDonors = await this.prisma.$queryRaw`
      WITH donor_totals AS (
        SELECT 
          d."id" as "donorId",
          d."name",
          d."email",
          COUNT(don."id") as "donationCount",
          COALESCE(SUM(don."amount"), 0) as "totalAmount"
        FROM 
          "Donor" d
        LEFT JOIN 
          "Donation" don ON d."id" = don."donorId"
        WHERE 
          don."date" >= ${startDate} AND don."date" <= ${now}
        GROUP BY 
          d."id", d."name", d."email"
        ORDER BY 
          "totalAmount" DESC
        LIMIT ${limit}
      )
      SELECT * FROM donor_totals
      WHERE "totalAmount" > 0
    `

    // Cache the result
    setCache(cacheKey, topDonors, this.cacheTTL)

    return topDonors
  }
}

module.exports = DonorService
