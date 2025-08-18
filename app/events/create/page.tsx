"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEvent } from "@/lib/firestore"
import { useAuth } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Timestamp } from "firebase/firestore"

export default function CreateEventPage() {
  const router = useRouter()
  const { civicUser, firestoreUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!civicUser) return

    setLoading(true)
    try {
      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`)
      const eventTimestamp = Timestamp.fromDate(eventDateTime)

      // Use firestoreUser.id if available, otherwise use civicUser.id
      const organizerId = firestoreUser?.id || civicUser.id

      const eventId = await createEvent({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        date: eventTimestamp,
        organizerId: organizerId,
      })

      toast({
        title: "Event Created Successfully!",
        description: `${formData.title} has been created and is ready for registrations.`,
        variant: "default",
      })

      router.push(`/events/${eventId}`)
    } catch (error: any) {
      console.error("Error creating event:", error)
      
      // More specific error messages
      let errorMessage = "There was a problem creating your event. Please try again."
      
      if (error?.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check your Firebase security rules."
      } else if (error?.code === 'unavailable') {
        errorMessage = "Firebase service is unavailable. Please try again later."
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error Creating Event",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <Navbar />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-black/40 backdrop-blur-sm border border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Event Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter event title"
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
                    placeholder="Describe your event"
                    rows={4}
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
                    placeholder="Event location"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-gray-300">Date</Label>
                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-gray-300">Time</Label>
                    <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold shadow-sm hover:shadow-sm hover:shadow-yellow-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                  {loading ? "Creating Event..." : "Create Event"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
