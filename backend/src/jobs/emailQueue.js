const { Queue } = require("bullmq")
const dotenv = require("dotenv")

dotenv.config()

// Create email queue with in-memory storage
const emailQueue = new Queue("email", {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: 100, // Keep the last 100 failed jobs
  },
})

/**
 * Add thank you email job to queue
 * @param {Object} data - Email data
 * @returns {Promise<Object>} - Job result
 */
async function queueThankYouEmail(data) {
  return emailQueue.add("thank-you", data)
}

/**
 * Add reminder email job to queue
 * @param {Object} data - Email data
 * @returns {Promise<Object>} - Job result
 */
async function queueReminderEmail(data) {
  return emailQueue.add("reminder", data)
}

/**
 * Add bulk email job to queue
 * @param {Array} recipients - Email recipients
 * @param {string} type - Email type
 * @returns {Promise<Object>} - Job result
 */
async function queueBulkEmails(recipients, type) {
  return emailQueue.add("bulk", { recipients, type })
}

module.exports = {
  emailQueue,
  queueThankYouEmail,
  queueReminderEmail,
  queueBulkEmails,
}
