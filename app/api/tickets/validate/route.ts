import { type NextRequest, NextResponse } from "next/server"
import { getTicketByQrCode, checkInTicket, getEventById, getUserByCivicId } from "@/lib/firestore"

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 })
    }

    // Find ticket by QR code
    const ticket = await getTicketByQrCode(qrCode)
    if (!ticket) {
      return NextResponse.json(
        {
          valid: false,
          message: "Invalid ticket - not found",
        },
        { status: 404 },
      )
    }

    // Check if already checked in
    if (ticket.checkedIn) {
      return NextResponse.json({
        valid: false,
        message: "Ticket already used",
        ticket,
      })
    }

    // Get event details
    const event = await getEventById(ticket.eventId)
    if (!event) {
      return NextResponse.json(
        {
          valid: false,
          message: "Event not found",
        },
        { status: 404 },
      )
    }

    // Get user details to show name
    const user = await getUserByCivicId(ticket.userId)
    const userName = user?.name || "Unknown User"

    // Mark ticket as checked in
    await checkInTicket(ticket.id!)

    return NextResponse.json({
      valid: true,
      message: `Welcome ${userName}! Checked in successfully`,
      ticket: {
        ...ticket,
        checkedIn: true,
        checkedInAt: new Date(),
      },
      event,
      user: {
        name: userName,
        email: user?.email || "",
      },
    })
  } catch (error) {
    console.error("Validation error:", error)
    return NextResponse.json({ error: "Validation failed" }, { status: 500 })
  }
}
