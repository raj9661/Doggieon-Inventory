/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Prisma error handling
  if (err.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Resource already exists",
        error: `Unique constraint failed on the ${err.meta?.target}`,
      })
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Resource not found",
        error: err.meta?.cause || "The requested resource does not exist",
      })
    }
  }

  // JWT error handling
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
      error: err.message,
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired",
      error: err.message,
    })
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? "Something went wrong" : err.stack,
  })
}

module.exports = errorHandler
