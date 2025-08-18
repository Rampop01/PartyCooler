"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getEventById, type Event } from "@/lib/firestore"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock } from "lucide-react"
import type { Timestamp } from "firebase/firestore"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { civicUser, firestoreUser } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id as string)
    }
  }, [params.id])

  const loadEvent = async (eventId: string) => {
    try {
      const eventData = await getEventById(eventId)
      setEvent(eventData)
    } catch (error) {
      console.error("Error loading event:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!event || !civicUser) return

    setRegistering(true)
    try {
      router.push(`/events/${event.id}/register`)
    } catch (error) {
      console.error("Registration error:", error)
    } finally {
      setRegistering(false)
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toJsDate = (date: Timestamp | Date): Date =>
    (typeof (date as any)?.toDate === "function" ? (date as Timestamp).toDate() : (date as Date))

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
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
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 bg-black/40 backdrop-blur-sm border border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">{event.title}</CardTitle>
            <CardDescription className="text-lg text-gray-300">{event.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-white">Date</p>
                  <p className="text-gray-300">{formatDate(event.date)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-white">Time</p>
                  <p className="text-gray-300">{formatTime(event.date)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-white">Location</p>
                  <p className="text-gray-300">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Registration controls */}
            {(() => {
              const ended = toJsDate(event.date) < new Date()
              if (ended) {
                return (
                  <div className="pt-6 border-t">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3">
                      Registration closed — this event has ended.
                    </div>
                  </div>
                )
              }
              if (civicUser) {
                return (
                  <div className="pt-6 border-t">
                    <Button
                      onClick={handleRegister}
                      disabled={registering}
                      className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold shadow-sm hover:shadow-sm hover:shadow-yellow-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                      size="lg"
                    >
                      {registering ? "Registering..." : "Register for Event"}
                    </Button>
                  </div>
                )
              }
              return null
            })()}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
