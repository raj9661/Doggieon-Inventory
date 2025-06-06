const express = require("express")
const helmet = require("helmet")
const compression = require("compression")
const cors = require("cors")
const { PrismaClient } = require("@prisma/client")
const pino = require("pino-http")()
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Import routes
const donorRoutes = require("./routes/donorRoutes")
const donationRoutes = require("./routes/donationRoutes")
const inventoryRoutes = require("./routes/inventoryRoutes")
const messageRoutes = require("./routes/messageRoutes")
const authRoutes = require("./routes/authRoutes")
const emailRoutes = require("./routes/emailRoutes")

// Import middleware
const errorHandler = require("./middleware/errorHandler")

// Initialize Express app
const app = express()

// Initialize Prisma client
const prisma = new PrismaClient()

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json())
app.use(pino)

// Make Prisma available to routes
app.use((req, res, next) => {
  req.prisma = prisma
  next()
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/donors", donorRoutes)
app.use("/api/donations", donationRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/email", emailRoutes)

// Error handling middleware
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err)
  // Close server & exit process
  process.exit(1)
})

module.exports = app
