"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getUserTickets, getAllEvents, getEventById, type Ticket, type Event } from "@/lib/firestore"
import { TicketCard } from "@/components/tickets/ticket-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TicketIcon, Calendar, Plus } from "lucide-react"

interface TicketWithEvent extends Ticket {
  event: Event
}

export function AttendeesDashboard() {
  const { firestoreUser } = useAuth()
  const [tickets, setTickets] = useState<TicketWithEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (firestoreUser) {
      loadDashboardData()
    }
  }, [firestoreUser])

  const loadDashboardData = async () => {
    if (!firestoreUser) return

    try {
      // Load user tickets
      const userTickets = await getUserTickets(firestoreUser.id!)
      const ticketsWithEvents = await Promise.all(
        userTickets.map(async (ticket) => {
          const event = await getEventById(ticket.eventId)
          return { ...ticket, event: event! }
        }),
      )

      setTickets(ticketsWithEvents)

      // Load upcoming events (not registered for)
      const allEvents = await getAllEvents()
      const registeredEventIds = userTickets.map((t) => t.eventId)
      const availableEvents = allEvents.filter((event) => !registeredEventIds.includes(event.id!))

      setUpcomingEvents(availableEvents.slice(0, 3)) // Show top 3
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {firestoreUser?.name}!</h1>
        <p className="text-lg text-gray-600">Manage your tickets and discover new events</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TicketIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                <p className="text-gray-600">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{tickets.filter((t) => t.checkedIn).length}</p>
                <p className="text-gray-600">Events Attended</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Plus className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                <p className="text-gray-600">Available Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Tickets */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets yet</h3>
              <p className="text-gray-600 mb-4">Register for events to get your tickets</p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} event={ticket.event} />
            ))}
          </div>
        )}
      </div>

      {/* Discover Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Discover Events</h2>
            <Link href="/">
              <Button variant="outline">View All Events</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>{event.date.toDate().toLocaleDateString()}</p>
                    <p>{event.location}</p>
                  </div>
                  <Link href={`/events/${event.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View Event</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
