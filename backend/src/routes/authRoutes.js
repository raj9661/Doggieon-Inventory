const express = require("express")
const { login, validateToken, register } = require("../controllers/authController")
const { authLimiter } = require("../middleware/rateLimiter")
const { validateLogin } = require("../middleware/validate")
const auth = require("../middleware/auth")

const router = express.Router()

// Apply rate limiting to login route
router.post("/login", authLimiter, validateLogin, login)

// Validate token
router.get("/validate", auth, validateToken)

// Register new admin (admin only)
router.post("/register", auth, register)

module.exports = router
