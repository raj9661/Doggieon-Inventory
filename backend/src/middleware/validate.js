const { z } = require("zod")

/**
 * Validate request body against schema
 * @param {Object} schema - Zod schema
 * @returns {Function} - Middleware function
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body)
    next()
  } catch (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors,
    })
  }
}

// Donor schema
const donorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  type: z.enum([
    "FOOD_AND_NUTRITION",
    "MEDICAL_CARE",
    "SHELTER_AND_HOUSING",
    "WINTER_CARE",
    "EMERGENCY_FUND",
    "CUSTOM_AMOUNT"
  ]).default("CUSTOM_AMOUNT"),
})

// Donation schema
const donationSchema = z.object({
  donorId: z.string().uuid("Invalid donor ID"),
  amount: z.number().optional(),
  type: z.enum([
    "FOOD_AND_NUTRITION",
    "MEDICAL_CARE",
    "SHELTER_AND_HOUSING",
    "WINTER_CARE",
    "EMERGENCY_FUND",
    "CUSTOM_AMOUNT"
  ]),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
})

// Inventory item schema
const inventoryItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string(),
  quantity: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  isForSale: z.boolean().default(false),
  price: z.number().optional(),
  description: z.string().optional(),
})

// Message schema
const messageSchema = z.object({
  donorId: z.string().uuid("Invalid donor ID"),
  type: z.enum(["THANK_YOU", "REMINDER", "NEWSLETTER"]),
  customSubject: z.string().optional(),
  customContent: z.string().optional(),
})

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// Middleware functions
const validateDonor = validate(donorSchema)
const validateDonation = validate(donationSchema)
const validateInventoryItem = validate(inventoryItemSchema)
const validateMessage = validate(messageSchema)
const validateLogin = validate(loginSchema)

module.exports = {
  validateDonor,
  validateDonation,
  validateInventoryItem,
  validateMessage,
  validateLogin,
}
