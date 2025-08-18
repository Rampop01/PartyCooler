import { type NextRequest, NextResponse } from "next/server"
import { createTicket, getEventById, getExistingTicket } from "@/lib/firestore"
import { generateQRCode } from "@/lib/qr-utils"

export async function POST(request: NextRequest) {
  try {
    const { eventId, userId } = await request.json()

    if (!eventId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify event exists
    const event = await getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user already has a ticket for this event
    const existingTicket = await getExistingTicket(userId, eventId)
    if (existingTicket) {
      return NextResponse.json({
        success: true,
        ticketId: existingTicket.id,
        qrCode: existingTicket.qrCode,
        message: "You are already registered for this event"
      })
    }

    // Generate unique QR code
    const qrCode = generateQRCode(eventId, userId)

    // Create ticket in Firestore
    const ticketId = await createTicket({
      userId,
      eventId,
      qrCode,
      checkedIn: false,
    })

    return NextResponse.json({
      success: true,
      ticketId,
      qrCode,
      message: "Successfully registered for event"
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
