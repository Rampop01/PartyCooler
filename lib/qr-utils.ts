import { v4 as uuidv4 } from "uuid"

export const generateQRCode = (eventId: string, userId: string): string => {
  // Generate a unique QR code that includes event and user info
  const ticketId = uuidv4()
  return `EVENTKEY-${eventId}-${userId}-${ticketId}`
}

export const parseQRCode = (qrCode: string) => {
  const parts = qrCode.split("-")
  if (parts.length !== 4 || parts[0] !== "EVENTKEY") {
    return null
  }

  return {
    eventId: parts[1],
    userId: parts[2],
    ticketId: parts[3],
  }
}
