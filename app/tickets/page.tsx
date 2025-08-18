"use client"

import { useEffect, useState } from "react"
import { useUser } from "@civic/auth/react"
import { getUserTickets, getEventById, type Ticket, type Event } from "@/lib/firestore"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCodeDisplay } from "@/components/tickets/qr-code-display"
import { Calendar, MapPin, Clock, Ticket as TicketIcon } from "lucide-react"
import Link from "next/link"

interface TicketWithEvent extends Ticket {
  event: Event
}

export default function MyTicketsPage() {
  const { user: civicUser } = useUser()
  const [tickets, setTickets] = useState<TicketWithEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<TicketWithEvent | null>(null)

  useEffect(() => {
    if (civicUser?.id) {
      loadUserTickets()
    }
  }, [civicUser])

  const loadUserTickets = async () => {
    if (!civicUser?.id) return

    try {
      const userTickets = await getUserTickets(civicUser.id)
      
      // Get event details for each ticket
      const ticketsWithEvents = await Promise.all(
        userTickets.map(async (ticket) => {
          const event = await getEventById(ticket.eventId)
          return {
            ...ticket,
            event: event!
          }
        })
      )

      setTickets(ticketsWithEvents)
    } catch (error) {
      console.error("Error loading tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: any) => {
    const eventDate = date.toDate ? date.toDate() : new Date(date)
    return eventDate.toLocaleDateString()
  }

  const formatTime = (date: any) => {
    const eventDate = date.toDate ? date.toDate() : new Date(date)
    return eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (selectedTicket) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-black">
          <Navbar />
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button 
              variant="ghost" 
              className="mb-6 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
              onClick={() => setSelectedTicket(null)}
            >
              ← Back to My Tickets
            </Button>

            <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white text-center">
                  {selectedTicket.event.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                      <Calendar className="h-5 w-5 text-yellow-400" />
                    </div>
                    <span>{formatDate(selectedTicket.event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <span>{formatTime(selectedTicket.event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                      <MapPin className="h-5 w-5 text-yellow-400" />
                    </div>
                    <span>{selectedTicket.event.location}</span>
                  </div>
                </div>

                <div className="border-t border-yellow-500/20 pt-6">
                  <QRCodeDisplay 
                    qrCode={selectedTicket.qrCode}
                    eventTitle={selectedTicket.event.title}
                    eventDate={formatDate(selectedTicket.event.date)}
                    eventLocation={selectedTicket.event.location}
                  />
                </div>

                {selectedTicket.checkedIn && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center text-green-400">
                      <TicketIcon className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Checked In</span>
                    </div>
                    {selectedTicket.checkedInAt && (
                      <p className="text-sm text-green-300 mt-1">
                        {selectedTicket.checkedInAt.toDate().toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
            <p className="text-gray-300">View and manage your event tickets</p>
          </div>

          {tickets.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
              <CardContent className="text-center py-12">
                <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Tickets Yet</h3>
                <p className="text-gray-300 mb-6">You haven't registered for any events yet.</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold shadow-sm hover:shadow-sm hover:shadow-yellow-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                    Browse Events
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover:bg-black/60 hover:border-yellow-500/40 transition-all duration-500 hover-lift cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-white group-hover:text-yellow-200 transition-colors">
                      {ticket.event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-300">
                        <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                          <Calendar className="h-4 w-4 text-yellow-400" />
                        </div>
                        <span>{formatDate(ticket.event.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                          <Clock className="h-4 w-4 text-yellow-400" />
                        </div>
                        <span>{formatTime(ticket.event.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                          <MapPin className="h-4 w-4 text-yellow-400" />
                        </div>
                        <span>{ticket.event.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-yellow-500/20">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.checkedIn 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {ticket.checkedIn ? 'Checked In' : 'Ready to Use'}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTicket(ticket)
                        }}
                      >
                        View QR Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
