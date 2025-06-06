const nodemailer = require("nodemailer")
const { Resend } = require("resend")
const dotenv = require("dotenv")

dotenv.config()

// Determine which email service to use
const useResend = process.env.EMAIL_SERVICE === "resend"

// Initialize email client
let resend
let transporter

if (useResend) {
  resend = new Resend(process.env.RESEND_API_KEY)
} else {
  // Configure nodemailer
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} - Email send result
 */
async function sendEmail({ to, subject, text, html }) {
  try {
    if (useResend) {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
      })

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, messageId: data.id }
    } else {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
      })

      return { success: true, messageId: info.messageId }
    }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate thank you email
 * @param {string} donorName - Donor name
 * @param {number} amount - Donation amount
 * @param {string} type - Donation type
 * @returns {Object} - Email content
 */
function generateThankYouEmail(donorName, amount, type) {
  const subject = "Thank you for your generous donation!"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Thank You, ${donorName}!</h2>
      <p>We are incredibly grateful for your generous donation${amount ? ` of $${amount}` : ""}${type ? ` (${type})` : ""}.</p>
      <p>Your support helps us continue our mission to care for animals in need.</p>
      <p>With heartfelt appreciation,<br>The NGO Team</p>
    </div>
  `
  const text = `Thank You, ${donorName}! We are incredibly grateful for your generous donation${amount ? ` of $${amount}` : ""}${type ? ` (${type})` : ""}. Your support helps us continue our mission to care for animals in need. With heartfelt appreciation, The NGO Team`

  return { subject, html, text }
}

/**
 * Generate reminder email
 * @param {string} donorName - Donor name
 * @returns {Object} - Email content
 */
function generateReminderEmail(donorName) {
  const subject = "We miss your support!"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Hello ${donorName},</h2>
      <p>We hope you're doing well! It's been a while since your last donation.</p>
      <p>Your continued support makes a real difference in the lives of animals we care for.</p>
      <p>If you'd like to make a donation, please visit our website or contact us directly.</p>
      <p>Thank you for being part of our community!</p>
    </div>
  `
  const text = `Hello ${donorName}, We hope you're doing well! It's been a while since your last donation. Your continued support makes a real difference in the lives of animals we care for. If you'd like to make a donation, please visit our website or contact us directly. Thank you for being part of our community!`

  return { subject, html, text }
}

module.exports = {
  sendEmail,
  generateThankYouEmail,
  generateReminderEmail,
}
