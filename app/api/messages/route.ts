import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"
import { sendEmail, generateThankYouEmail, generateReminderEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { donorId, type, customSubject, customContent } = await request.json()

    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
    })

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    let subject: string
    let content: string

    if (customSubject && customContent) {
      subject = customSubject
      content = customContent
    } else {
      const emailTemplate = type === "THANK_YOU" ? generateThankYouEmail(donor.name) : generateReminderEmail(donor.name)

      subject = emailTemplate.subject
      content = emailTemplate.html
    }

    // Create message record
    const message = await prisma.message.create({
      data: {
        donorId,
        type,
        subject,
        content,
        status: "PENDING",
      },
    })

    // Send email
    const emailResult = await sendEmail({
      to: donor.email,
      subject,
      html: content,
    })

    // Update message status
    await prisma.message.update({
      where: { id: message.id },
      data: {
        status: emailResult.success ? "SENT" : "FAILED",
        sentAt: emailResult.success ? new Date() : null,
      },
    })

    return NextResponse.json({
      message,
      emailSent: emailResult.success,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
