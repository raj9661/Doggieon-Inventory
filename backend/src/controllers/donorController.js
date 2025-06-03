const DonorService = require("../services/donorService")
const asyncHandler = require("../utils/asyncHandler")

/**
 * Get all donors with pagination and search
 */
const getDonors = asyncHandler(async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query
  const donorService = new DonorService(req.prisma)

  const result = await donorService.getDonors({
    page: Number.parseInt(page) || 1,
    limit: Number.parseInt(limit) || 10,
    search: search || "",
    sortBy: sortBy || "name",
    sortOrder: sortOrder || "asc",
  })

  res.status(200).json(result)
})

/**
 * Get donor by ID
 */
const getDonorById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const donorService = new DonorService(req.prisma)

  const donor = await donorService.getDonorById(id)

  if (!donor) {
    return res.status(404).json({ message: "Donor not found" })
  }

  res.status(200).json(donor)
})

/**
 * Create new donor
 */
const createDonor = asyncHandler(async (req, res) => {
  const donorService = new DonorService(req.prisma)
  const donor = await donorService.createDonor(req.body)

  res.status(201).json(donor)
})

/**
 * Update donor
 */
const updateDonor = asyncHandler(async (req, res) => {
  const { id } = req.params
  const donorService = new DonorService(req.prisma)

  try {
    const donor = await donorService.updateDonor(id, req.body)
    res.status(200).json(donor)
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Donor not found" })
    }
    throw error
  }
})

/**
 * Delete donor
 */
const deleteDonor = asyncHandler(async (req, res) => {
  const { id } = req.params
  const donorService = new DonorService(req.prisma)

  try {
    const donor = await donorService.deleteDonor(id)
    res.status(200).json(donor)
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Donor not found" })
    }
    throw error
  }
})

/**
 * Get top donors
 */
const getTopDonors = asyncHandler(async (req, res) => {
  const { period, limit } = req.query
  const donorService = new DonorService(req.prisma)

  const topDonors = await donorService.getTopDonors({
    period: period || "month",
    limit: Number.parseInt(limit) || 10,
  })

  res.status(200).json(topDonors)
})

module.exports = {
  getDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
  getTopDonors,
}
