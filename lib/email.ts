import nodemailer from "nodemailer"
import type { Transporter, TransportOptions } from "nodemailer"

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'doggiedon07@gmail.com',
    pass: 'wxkc ersl bxwb ubvk'  // Your Gmail App Password
  }
} as TransportOptions)

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
  try {
    const info = await transporter.sendMail({
      from: '"NGO Management System" <doggiedon07@gmail.com>',
      to,
      subject,
      html,
      text,
    })

    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error }
  }
}

export function generateThankYouEmail(donorName: string, amount?: number, type?: string, customMessage?: string) {
  const subject = "Thank you for your generous donation!"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Thank You, ${donorName}!</h2>
      <p>We are incredibly grateful for your generous donation${amount ? ` of $${amount}` : ""}${type ? ` (${type})` : ""}.</p>
      ${customMessage ? `<p>${customMessage}</p>` : ''}
      <p>Your support helps us continue our mission to care for animals in need.</p>
      <p>With heartfelt appreciation,<br>The NGO Team</p>
    </div>
  `
  const text = `Thank You, ${donorName}!\n\nWe are incredibly grateful for your generous donation${amount ? ` of $${amount}` : ""}${type ? ` (${type})` : ""}.\n\n${customMessage ? customMessage + '\n\n' : ''}Your support helps us continue our mission to care for animals in need.\n\nWith heartfelt appreciation,\nThe NGO Team`

  return { subject, html, text }
}

export function generateReminderEmail(donorName: string, customMessage?: string) {
  const subject = "We miss your support!"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Hello ${donorName},</h2>
      <p>We hope you're doing well! It's been a while since your last donation.</p>
      ${customMessage ? `<p>${customMessage}</p>` : ''}
      <p>Your continued support makes a real difference in the lives of animals we care for.</p>
      <p>If you'd like to make a donation, please visit our website or contact us directly.</p>
      <p>Thank you for being part of our community!</p>
    </div>
  `
  const text = `Hello ${donorName},\n\nWe hope you're doing well! It's been a while since your last donation.\n\n${customMessage ? customMessage + '\n\n' : ''}Your continued support makes a real difference in the lives of animals we care for.\n\nIf you'd like to make a donation, please visit our website or contact us directly.\n\nThank you for being part of our community!`

  return { subject, html, text }
}

// New function for bulk email sending with custom messages
export async function sendBulkEmails(recipients: Array<{
  email: string
  name: string
  amount?: number
  type?: string
}>, options: {
  type: 'THANK_YOU' | 'REMINDER'
  customSubject?: string
  customMessage?: string
  customTemplate?: string
}) {
  const results = []
  
  for (const recipient of recipients) {
    let emailContent
    
    if (options.customTemplate) {
      // Use custom template if provided
      emailContent = {
        subject: options.customSubject || "Message from NGO",
        html: options.customTemplate
          .replace(/\${name}/g, recipient.name)
          .replace(/\${amount}/g, recipient.amount?.toString() || '')
          .replace(/\${type}/g, recipient.type || ''),
        text: options.customTemplate
          .replace(/\${name}/g, recipient.name)
          .replace(/\${amount}/g, recipient.amount?.toString() || '')
          .replace(/\${type}/g, recipient.type || '')
          .replace(/<[^>]*>/g, '') // Remove HTML tags for text version
      }
    } else {
      // Use standard templates with custom message
      if (options.type === 'THANK_YOU') {
        emailContent = generateThankYouEmail(
          recipient.name,
          recipient.amount,
          recipient.type,
          options.customMessage
        )
      } else {
        emailContent = generateReminderEmail(
          recipient.name,
          options.customMessage
        )
      }
    }

    try {
      const result = await sendEmail({
        to: recipient.email,
        ...emailContent
      })
      results.push({ ...result, recipient: recipient.email })
      
      // Add a small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      results.push({ success: false, error, recipient: recipient.email })
    }
  }

  return results
}
