const { Worker } = require("bullmq")
const { sendEmail, generateThankYouEmail, generateReminderEmail } = require("../../config/email")
const dotenv = require("dotenv")

dotenv.config()

// Create email worker
const emailWorker = new Worker("email", async (job) => {
  const { name, data } = job

  console.log(`Processing ${name} email job`, data)

  try {
    switch (name) {
      case "thank-you":
        const thankYouEmail = generateThankYouEmail(data.donorName, data.amount, data.type)
        return await sendEmail({
          to: data.email,
          subject: thankYouEmail.subject,
          text: thankYouEmail.text,
          html: thankYouEmail.html,
        })

      case "reminder":
        const reminderEmail = generateReminderEmail(data.donorName)
        return await sendEmail({
          to: data.email,
          subject: reminderEmail.subject,
          text: reminderEmail.text,
          html: reminderEmail.html,
        })

      case "bulk":
        const results = []
        for (const recipient of data.recipients) {
          let emailContent

          if (data.type === "thank-you") {
            emailContent = generateThankYouEmail(recipient.name)
          } else if (data.type === "reminder") {
            emailContent = generateReminderEmail(recipient.name)
          }

          const result = await sendEmail({
            to: recipient.email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
          })

          results.push(result)

          // Add a small delay to avoid overwhelming the email service
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
        return results

      default:
        throw new Error(`Unknown email job type: ${name}`)
    }
  } catch (error) {
    console.error(`Error processing ${name} email job:`, error)
    throw error
  }
})

// Handle worker events
emailWorker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed`)
})

emailWorker.on("failed", (job, error) => {
  console.error(`Email job ${job?.id} failed:`, error)
})

module.exports = emailWorker
