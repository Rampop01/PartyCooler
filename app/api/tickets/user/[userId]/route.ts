import { type NextRequest, NextResponse } from "next/server"
import { getUserTickets } from "@/lib/firestore"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const tickets = await getUserTickets(userId)

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
}
