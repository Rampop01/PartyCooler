"use client"
import { useAuth } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { AttendeesDashboard } from "@/components/dashboard/attendees-dashboard"
import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard"
import { ScannerDashboard } from "@/components/dashboard/scanner-dashboard"

export default function DashboardPage() {
  const { civicUser, firestoreUser, isLoading } = useAuth()

  const renderDashboard = () => {
    // Defer rendering until auth (and Firestore user) has settled to prevent stale/default role
    if (!civicUser || isLoading) return null

    // Use firestoreUser role if available, otherwise default to ORGANIZER
    const userRole = firestoreUser?.role || "ORGANIZER"

    switch (userRole) {
      case "ATTENDEE":
        return <AttendeesDashboard />
      case "ORGANIZER":
        return <OrganizerDashboard />
      case "SCANNER":
        return <ScannerDashboard />
      default:
        return <OrganizerDashboard />
    }
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
