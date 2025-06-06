const express = require("express")
const { sendCustomEmail } = require("../controllers/emailController")
const { validateMessage } = require("../middleware/validate")
const auth = require("../middleware/auth")

const router = express.Router()

// Apply authentication to all routes
router.use(auth)

// Send custom email
router.post("/send", validateMessage, sendCustomEmail)

module.exports = router 