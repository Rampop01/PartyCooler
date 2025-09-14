  "use client"
  // Helper to check if event has ended
  const isEventEnded = event => {
    if (!event) return false;
    const now = new Date();
    return event.date.toDate() < now;
  };


import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getEventById, updateEvent, type Event } from "@/lib/firestore"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
  })

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id as string)
    }
  }, [params.id])

  const loadEvent = async (eventId: string) => {
    try {
      const eventData = await getEventById(eventId)
      if (eventData) {
        setEvent(eventData)
        const eventDate = eventData.date.toDate()
        setFormData({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          date: eventDate.toISOString().split('T')[0],
          time: eventDate.toTimeString().slice(0, 5),
        })
      }
    } catch (error) {
      console.error("Error loading event:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    setUpdating(true)
    try {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`)
      
      await updateEvent(event.id, {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        date: eventDateTime,
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating event:", error)
    } finally {
      setUpdating(false)
    }
  }

  // Custom multi-role guard: allow ORGANIZER or SCANNER
  const { civicUser, firestoreUser, isLoading: authLoading } = require("@/contexts/auth-context").useAuth();
  const allowedRoles = ["ORGANIZER", "SCANNER"];
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }
  if (!civicUser || !firestoreUser || !allowedRoles.includes(firestoreUser.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-yellow-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-red-400">Access Denied</CardTitle>
            <p className="text-gray-300">
              You don't have permission to access this page. Required role: ORGANIZER or SCANNER
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
              <p className="text-gray-300">The event you're trying to edit doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard">
            <Button variant="ghost" className="mb-6 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Edit Event</CardTitle>
            </CardHeader>
            <CardContent>
              {isEventEnded(event) && (
                <div className="mb-4 p-4 bg-red-900/40 border border-red-500/30 rounded text-red-300 text-center">
                  This event has ended and can no longer be edited.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Event Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    className="bg-black/20 border-yellow-500/30 text-white"
                    disabled={isEventEnded(event)}
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    rows={4}
                    className="bg-black/20 border-yellow-500/30 text-white"
                    disabled={isEventEnded(event)}
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    required 
                    className="bg-black/20 border-yellow-500/30 text-white"
                    disabled={isEventEnded(event)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-gray-300">Date</Label>
                    <Input 
                      id="date" 
                      name="date" 
                      type="date" 
                      value={formData.date} 
                      onChange={handleChange} 
                      required 
                      className="bg-black/20 border-yellow-500/30 text-white"
                      disabled={isEventEnded(event)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-gray-300">Time</Label>
                    <Input 
                      id="time" 
                      name="time" 
                      type="time" 
                      value={formData.time} 
                      onChange={handleChange} 
                      required 
                      className="bg-black/20 border-yellow-500/30 text-white"
                      disabled={isEventEnded(event)}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={updating || isEventEnded(event)} 
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold shadow-sm hover:shadow-sm hover:shadow-yellow-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                >
                  {updating ? "Updating Event..." : "Update Event"}
                </Button>
              </form>
            </CardContent>
          </Card>

        </main>
      </div>
  );
}


