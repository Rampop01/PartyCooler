"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getEventById, getEventAttendees, getUserByCivicId, type Event, type Ticket } from "@/lib/firestore"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

interface AttendeeWithUser extends Ticket {
  userName: string
  userEmail: string
}

export default function EventAttendeesPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<AttendeeWithUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadEventData(params.id as string)
    }
  }, [params.id])

  const loadEventData = async (eventId: string) => {
    try {
      const [eventData, ticketData] = await Promise.all([getEventById(eventId), getEventAttendees(eventId)])

      setEvent(eventData)

      // Get user details for each ticket
      const attendeesWithUsers = await Promise.all(
        ticketData.map(async (ticket) => {
          const user = await getUserByCivicId(ticket.userId)
          return {
            ...ticket,
            userName: user?.name || "Unknown User",
            userEmail: user?.email || "Unknown Email",
          }
        }),
      )

      setAttendees(attendeesWithUsers)
    } catch (error) {
      console.error("Error loading event data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="ORGANIZER">
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!event) {
    return (
      <AuthGuard requiredRole="ORGANIZER">
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
              <CardContent className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
                <p className="text-gray-300">The event you're looking for doesn't exist.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const checkedInCount = attendees.filter((a) => a.checkedIn).length

  return (
    <AuthGuard requiredRole="ORGANIZER">
      <div className="min-h-screen bg-black">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
              <p className="text-lg text-gray-300">Event Attendees</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-500/20 p-3 rounded-lg">
                      <Users className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-white">{attendees.length}</p>
                      <p className="text-gray-300">Total Registered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-green-500/20 p-3 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-white">{checkedInCount}</p>
                      <p className="text-gray-300">Checked In</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-orange-500/20 p-3 rounded-lg">
                      <Clock className="h-8 w-8 text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-white">
                        {attendees.length > 0 ? Math.round((checkedInCount / attendees.length) * 100) : 0}%
                      </p>
                      <p className="text-gray-300">Attendance Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendees List */}
            <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white">Attendee List</CardTitle>
              </CardHeader>
              <CardContent>
                {attendees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-300">No attendees registered yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg hover:bg-yellow-500/10 transition-all duration-300 animate-fade-in-up hover-lift">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-black font-semibold">
                              {attendee.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{attendee.userName}</p>
                            <p className="text-sm text-gray-300">{attendee.userEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={attendee.checkedIn ? "default" : "secondary"} className={attendee.checkedIn ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
                            {attendee.checkedIn ? "Checked In" : "Registered"}
                          </Badge>
                          {attendee.checkedIn && attendee.checkedInAt && (
                            <span className="text-xs text-gray-400">
                              {attendee.checkedInAt.toDate().toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
