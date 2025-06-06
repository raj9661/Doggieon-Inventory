const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const asyncHandler = require("../utils/asyncHandler")

// Your provided JWT secret
const JWT_SECRET =
  "2a72dfc6df3e3550a5378842370d14c7ad94eade904b5b14595ff95ee1f6cf22b0e14af21b281f0752660013c9adad85afa0987dae0f3f86b1157577f2ad2ecd1bb017154a32b25080b9952546ff1727ac11028edfdf75246eeec85d0e3cbda6a8276e05540356aaadec06579b6bc751714a7f102528090c93f987bfcd626b0fb1f28b889196be82022fbaa47b7d5c15348513913724f59bf35c2d7f703ff6bf1b15411163b2208df3794f03b70cc45be88bfc00f691224a4b4eb8c67a8bf6fdd31ea7b5f5a3bcc8fcf7a542c0c59a26250b3087d54cc88c733e7452d162e6653fa1a907937b4bf78a1e4f699da6ebd648bebe802fa553a9f96239c23e03a503"

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  // Check if user exists
  const admin = await req.prisma.admin.findUnique({
    where: { username },
  })

  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  // Check if password is correct
  const isMatch = await bcrypt.compare(password, admin.password)

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  // Create token
  const token = jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" },
  )

  res.status(200).json({
    token,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
  })
})

/**
 * Validate token
 */
const validateToken = asyncHandler(async (req, res) => {
  res.status(200).json({ valid: true, user: req.user })
})

/**
 * Register user (admin only)
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body

  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" })
  }

  // Check if user already exists
  const existingUser = await req.prisma.admin.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  })

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" })
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create user
  const user = await req.prisma.admin.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    },
  })

  res.status(201).json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  })
})

module.exports = {
  login,
  validateToken,
  register,
}
