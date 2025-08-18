"use client"

import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock } from "lucide-react"
import type { Ticket, Event } from "@/lib/firestore"
import type { Timestamp } from "firebase/firestore"

interface TicketCardProps {
  ticket: Ticket
  event: Event
}

export function TicketCard({ ticket, event }: TicketCardProps) {
  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</CardTitle>
          <Badge variant={ticket.checkedIn ? "default" : "secondary"}>{ticket.checkedIn ? "Used" : "Valid"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <QRCodeSVG value={ticket.qrCode} size={120} level="H" includeMargin={true} className="border rounded" />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {formatTime(event.date)}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
        </div>

        {ticket.checkedIn && ticket.checkedInAt && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Checked in: {ticket.checkedInAt.toDate().toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
