const asyncHandler = require("../utils/asyncHandler")
const { sendEmail } = require("../config/email")
const { queueBulkEmails } = require("../jobs/emailQueue")

/**
 * Send custom email to a donor
 */
const sendCustomEmail = asyncHandler(async (req, res) => {
  const { donorId, type, customSubject, customContent } = req.body

  // Get donor information
  const donor = await req.prisma.donor.findUnique({
    where: { id: donorId },
  })

  if (!donor) {
    return res.status(404).json({ message: "Donor not found" })
  }

  // Prepare email content
  const emailContent = {
    subject: customSubject || "Message from NGO",
    html: customContent || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Hello ${donor.name},</h2>
        <p>${customContent || "Thank you for your continued support!"}</p>
        <p>Best regards,<br>The NGO Team</p>
      </div>
    `,
    text: customContent || `Hello ${donor.name},\n\nThank you for your continued support!\n\nBest regards,\nThe NGO Team`,
  }

  // Send email
  const result = await sendEmail({
    to: donor.email,
    ...emailContent,
  })

  if (!result.success) {
    return res.status(500).json({ message: "Failed to send email", error: result.error })
  }

  res.status(200).json({
    message: "Email sent successfully",
    messageId: result.messageId,
  })
})

module.exports = {
  sendCustomEmail,
} 