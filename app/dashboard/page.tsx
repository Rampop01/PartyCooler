"use client"
import { useAuth } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"

import { AttendeesDashboard } from "@/components/dashboard/attendees-dashboard"
import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard"
import { ScannerDashboard } from "@/components/dashboard/scanner-dashboard"
import { useState } from "react"
import { Button } from "@/components/ui/button"


export default function DashboardPage() {
  const { civicUser, firestoreUser, isLoading } = useAuth()
  const [adminView, setAdminView] = useState<'organizer' | 'scanner'>('organizer')

  const renderDashboard = () => {
    if (!civicUser || isLoading) return null
    const userRole = firestoreUser?.role || "ORGANIZER"

    if (userRole === "ATTENDEE") {
      return <AttendeesDashboard />
    }

    // For ORGANIZER and SCANNER roles, show toggle and default to OrganizerDashboard
    if (userRole === "ORGANIZER" || userRole === "SCANNER") {
      return (
        <>
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => setAdminView(adminView === 'organizer' ? 'scanner' : 'organizer')}
            >
              {adminView === 'organizer' ? 'Switch to Scanner Dashboard' : 'Back to Organizer Dashboard'}
            </Button>
          </div>
          {adminView === 'organizer' ? <OrganizerDashboard /> : <ScannerDashboard />}
        </>
      )
    }
    return <OrganizerDashboard />
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            renderDashboard()
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
