"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getEventAttendees, type Event } from "@/lib/firestore"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Plus, BarChart3 } from "lucide-react"

interface EventWithStats extends Event {
  totalAttendees: number
  checkedInCount: number
}

export function OrganizerDashboard() {
  const { civicUser, firestoreUser, isLoading: authLoading } = useAuth()
  const [events, setEvents] = useState<EventWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!civicUser || authLoading) return

    setLoading(true)

    const ids = [firestoreUser?.id, civicUser.id].filter(Boolean) as string[]
    // If no ids for some reason, don't subscribe
    if (ids.length === 0) return

    // Subscribe to events owned by either Firestore user id or Civic user id
    const q = query(collection(db, "events"), where("organizerId", "in", ids))

    const unsubscribe = onSnapshot(
      q,
      async (snap) => {
        try {
          const baseEvents: Event[] = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }))
          const eventsWithStats = await Promise.all(
            baseEvents.map(async (event) => {
              const attendees = await getEventAttendees(event.id!)
              return {
                ...event,
                totalAttendees: attendees.length,
                checkedInCount: attendees.filter((a) => a.checkedIn).length,
              }
            }),
          )
          setEvents(eventsWithStats)
        } catch (e) {
          console.error("Error processing organizer snapshot:", e)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error("Organizer events subscription error:", err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [civicUser, firestoreUser?.id, authLoading])

  // Reload when window gains focus or tab becomes visible
  useEffect(() => {
    const onFocus = () => {
      if (!civicUser || authLoading) return
      loadOrganizerData()
    }
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus()
    }
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [civicUser, authLoading])

  const loadOrganizerData = async () => {
    // Manual refresh triggers by re-running stats over the last known snapshot via a one-off query
    if (!civicUser) return
    try {
      setLoading(true)
      const ids = [firestoreUser?.id, civicUser.id].filter(Boolean) as string[]
      if (ids.length === 0) return
      const q = query(collection(db, "events"), where("organizerId", "in", ids))
      const eventsWithStats: EventWithStats[] = []
      // Use a temporary onSnapshot that immediately unsubscribes after first emission
      await new Promise<void>((resolve) => {
        const unsub = onSnapshot(q, async (snap) => {
          const baseEvents: Event[] = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }))
          const stats = await Promise.all(
            baseEvents.map(async (event) => {
              const attendees = await getEventAttendees(event.id!)
              return {
                ...event,
                totalAttendees: attendees.length,
                checkedInCount: attendees.filter((a) => a.checkedIn).length,
              } as EventWithStats
            }),
          )
          eventsWithStats.splice(0, eventsWithStats.length, ...stats)
          setEvents(eventsWithStats)
          unsub()
          resolve()
        })
      })
    } catch (error) {
      console.error("Error loading organizer data:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalAttendees = events.reduce((sum, event) => sum + event.totalAttendees, 0)
  const totalCheckedIn = events.reduce((sum, event) => sum + event.checkedInCount, 0)
  const checkInRate = totalAttendees > 0 ? Math.round((totalCheckedIn / totalAttendees) * 100) : 0

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Organizer Dashboard</h1>
          <p className="text-gray-300">Manage your events and track attendance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadOrganizerData()}
            disabled={loading}
            className="border-yellow-400/50 text-yellow-300 bg-black hover:bg-yellow-500/10 hover:text-white"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover:bg-black/60 hover:border-yellow-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-black" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Events</p>
                <p className="text-2xl font-bold text-white">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover:bg-black/60 hover:border-yellow-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-3 rounded-xl">
                <Users className="h-6 w-6 text-black" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Attendees</p>
                <p className="text-2xl font-bold text-white">{totalAttendees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover:bg-black/60 hover:border-yellow-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-black" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Checked In</p>
                <p className="text-2xl font-bold text-white">{totalCheckedIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover:bg-black/60 hover:border-yellow-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-black" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Check-in Rate</p>
                <p className="text-2xl font-bold text-white">{checkInRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Events */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">My Events</h2>

        {events.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
            <CardContent className="text-center py-12">
              <Calendar className="h-24 w-24 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
              <p className="text-gray-300 mb-6">Create your first event to get started!</p>
              <Link href="/events/create">
                <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <Card key={event.id} className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover:bg-black/60 hover:border-yellow-500/40 transition-all duration-300 hover-lift animate-fade-in-up stagger-item">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-semibold text-white">{event.title}</CardTitle>
                    <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-300 animate-glow-pulse">
                      {event.totalAttendees} attendees
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-300 line-clamp-2">{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Checked In: {event.checkedInCount}</span>
                    <span>Rate: {event.totalAttendees > 0 ? Math.round((event.checkedInCount / event.totalAttendees) * 100) : 0}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold rounded-xl shadow-sm hover:shadow-sm hover:shadow-yellow-500/25 ">View Event</Button>
                    </Link>
                    <Link href={`/organizer/events/${event.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full border-yellow-400 text-white bg-black rounded-xl shadow-sm hover:shadow-sm hover:shadow-blue-500/25 ">Edit Event</Button>
                    </Link>
                    <Link href={`/organizer/events/${event.id}/attendees`} className="flex-1">
                      <Button variant="outline" className="w-full border-yellow-400 text-white bg-black rounded-xl shadow-sm hover:shadow-sm hover:shadow-yellow-500/25 ">Attendees</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
