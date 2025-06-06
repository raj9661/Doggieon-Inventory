const jwt = require("jsonwebtoken")
const asyncHandler = require("../utils/asyncHandler")

// Your provided JWT secret
const JWT_SECRET =
  "2a72dfc6df3e3550a5378842370d14c7ad94eade904b5b14595ff95ee1f6cf22b0e14af21b281f0752660013c9adad85afa0987dae0f3f86b1157577f2ad2ecd1bb017154a32b25080b9952546ff1727ac11028edfdf75246eeec85d0e3cbda6a8276e05540356aaadec06579b6bc751714a7f102528090c93f987bfcd626b0fb1f28b889196be82022fbaa47b7d5c15348513913724f59bf35c2d7f703ff6bf1b15411163b2208df3794f03b70cc45be88bfc00f691224a4b4eb8c67a8bf6fdd31ea7b5f5a3bcc8fcf7a542c0c59a26250b3087d54cc88c733e7452d162e6653fa1a907937b4bf78a1e4f699da6ebd648bebe802fa553a9f96239c23e03a503"

/**
 * Authenticate user
 */
const auth = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" })
  }

  // Get token
  const token = authHeader.split(" ")[1]

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Add user to request
    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" })
  }
})

module.exports = auth
