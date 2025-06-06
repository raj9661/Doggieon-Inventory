const express = require("express")
const {
  getDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
  getTopDonors,
} = require("../controllers/donorController")
const { apiLimiter } = require("../middleware/rateLimiter")
const { validateDonor } = require("../middleware/validate")
const auth = require("../middleware/auth")

const router = express.Router()

// Apply rate limiting to all routes
router.use(apiLimiter)

// Apply authentication to all routes
router.use(auth)

// Get all donors with pagination and search
router.get("/", getDonors)

// Get top donors
router.get("/top", getTopDonors)

// Get donor by ID
router.get("/:id", getDonorById)

// Create new donor
router.post("/", validateDonor, createDonor)

// Update donor
router.put("/:id", validateDonor, updateDonor)

// Delete donor
router.delete("/:id", deleteDonor)

module.exports = router
