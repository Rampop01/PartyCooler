"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getEventById, type Event } from "@/lib/firestore"
import { useAuth } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { QRCodeDisplay } from "@/components/tickets/qr-code-display"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Timestamp } from "firebase/firestore"

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const { civicUser, firestoreUser } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [ticket, setTicket] = useState<{ qrCode: string; ticketId: string } | null>(null)

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
    // Prevent registration for ended events
    const ended = (event.date as any)?.toDate ? (event.date as Timestamp).toDate() < new Date() : (event.date as unknown as Date) < new Date()
    if (ended) return

    setRegistering(true)
    try {
      const userId = firestoreUser?.id || civicUser.id
      const response = await fetch("/api/tickets/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          userId: userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTicket({
          qrCode: data.qrCode,
          ticketId: data.ticketId,
        })
      } else {
        console.error("Registration failed:", data.error)
      }
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toJsDate = (date: Timestamp | Date): Date =>
    (typeof (date as any)?.toDate === "function" ? (date as Timestamp).toDate() : (date as Date))

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

  if (!event) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
              <CardContent className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
                <p className="text-gray-300">The event you're trying to register for doesn't exist.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button onClick={() => router.back()} variant="ghost" className="mb-6 text-gray-300 hover:text-white hover:bg-yellow-500/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>

          {ticket ? (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Registration Successful!</h1>
                <p className="text-lg text-gray-300">Your ticket has been generated</p>
              </div>

              <QRCodeDisplay
                qrCode={ticket.qrCode}
                eventTitle={event.title}
                eventDate={formatDate(event.date)}
                eventLocation={event.location}
              />
            </div>
          ) : (
            <Card className="max-w-2xl mx-auto bg-black/40 backdrop-blur-sm border border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Register for Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-300 mb-4">{event.description}</p>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>
                      <strong className="text-yellow-400">Date:</strong> {formatDate(event.date)}
                    </p>
                    <p>
                      <strong className="text-yellow-400">Location:</strong> {event.location}
                    </p>
                  </div>
                </div>

                {(() => {
                  const ended = toJsDate(event.date) < new Date()
                  if (ended) {
                    return (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4">
                        Registration closed — this event has ended.
                      </div>
                    )
                  }
                  return (
                    <>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-400 mb-2">What happens next?</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• You'll receive a unique QR code ticket</li>
                          <li>• Present this QR code at the event entrance</li>
                          <li>• Your ticket will be validated for secure check-in</li>
                        </ul>
                      </div>

                      <Button
                        onClick={handleRegister}
                        disabled={registering}
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold shadow-sm hover:shadow-sm hover:shadow-yellow-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                        size="lg"
                      >
                        {registering ? "Generating Ticket..." : "Register & Get Ticket"}
                      </Button>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
