"use client"

import { useEffect, useState } from "react"
import { getAllEvents, type Event } from "@/lib/firestore"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [queryText, setQueryText] = useState("")
  const { civicUser } = useAuth()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const eventsData = await getAllEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error("Error loading events:", error)
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
    return eventDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toJsDate = (date: any): Date => (date?.toDate ? date.toDate() : new Date(date))

  const now = new Date()
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const normalized = (s: string) => s?.toLowerCase() || ""
  const filtered = events.filter((e) => {
    if (!queryText) return true
    const q = normalized(queryText)
    return (
      normalized(e.title).includes(q) ||
      normalized(e.description).includes(q) ||
      normalized(e.location).includes(q)
    )
  })

  const categorized = filtered.reduce(
    (acc, e) => {
      const d = toJsDate(e.date)
      if (isSameDay(d, now)) acc.ongoing.push(e)
      else if (d > now) acc.upcoming.push(e)
      else acc.ended.push(e)
      return acc
    },
    { ongoing: [] as Event[], upcoming: [] as Event[], ended: [] as Event[] },
  )

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in-up">
            Discover Events
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Find and register for amazing events happening near you
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400" />
            <Input
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search by title, description, or location"
              className="pl-9 bg-black/40 border-yellow-500/20 text-white placeholder:text-gray-400 focus-visible:ring-yellow-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : events.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Events Available</h3>
              <p className="text-gray-300 mb-6">Check back later for upcoming events.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Ongoing */}
            {categorized.ongoing.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">Ongoing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categorized.ongoing.map((event, index) => (
                    <Card
                      key={event.id}
                      className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover:bg-black/60 hover:border-yellow-500/40 transition-all duration-500 hover-lift animate-fade-in-up group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-white group-hover:text-yellow-200 transition-colors">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="text-gray-300 line-clamp-2">{event.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-300">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                              <Calendar className="h-4 w-4 text-yellow-400" />
                            </div>
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                              <Clock className="h-4 w-4 text-yellow-400" />
                            </div>
                            <span>{formatTime(event.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                              <MapPin className="h-4 w-4 text-yellow-400" />
                            </div>
                            <span>{(event as any).location}</span>
                          </div>
                        </div>
                        {civicUser ? (
                          <Link href={`/events/${event.id}/register`}>
                            <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                              Register for Event
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/events/${event.id}`}>
                            <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500  hover:from-yellow-600 hover:to-amber-600 text-black font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {categorized.upcoming.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">Upcoming</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categorized.upcoming.map((event, index) => (
                    <Card
                      key={event.id}
                      className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover:bg-black/60 hover:border-yellow-500/40 transition-all duration-500 hover-lift animate-fade-in-up group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-white group-hover:text-yellow-200 transition-colors">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="text-gray-300 line-clamp-2">{event.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-300">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                              <Calendar className="h-4 w-4 text-yellow-400" />
                            </div>
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                              <Clock className="h-4 w-4 text-yellow-400" />
                            </div>
                            <span>{formatTime(event.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                              <MapPin className="h-4 w-4 text-yellow-400" />
                            </div>
                            <span>{(event as any).location}</span>
                          </div>
                        </div>
                        {civicUser ? (
                          <Link href={`/events/${event.id}/register`}>
                            <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                              Register for Event
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/events/${event.id}`}>
                            <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Ended */}
            {categorized.ended.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-yellow-300 mb-4">Ended</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categorized.ended.map((event, index) => (
                    <Card
                      key={event.id}
                      className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 hover:bg-black/60 hover:border-yellow-500/40 transition-all duration-500 hover-lift animate-fade-in-up group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold text-white group-hover:text-yellow-200 transition-colors">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="text-gray-300 line-clamp-2">{event.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-300">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                              <Calendar className="h-4 w-4 text-yellow-400" />
                            </div>
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                              <Clock className="h-4 w-4 text-yellow-400" />
                            </div>
                            <span>{formatTime(event.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                              <MapPin className="h-4 w-4 text-yellow-400" />
                            </div>
                            <span>{(event as any).location}</span>
                          </div>
                        </div>
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline" className="w-full border-yellow-400/30 text-yellow-200 hover:bg-yellow-500/10">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
