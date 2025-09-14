"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { LoginButton } from "@/components/auth/login-button"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Scan, Menu, X } from "lucide-react"
import { useState } from "react"
export function Navbar() {
  const { civicUser, firestoreUser } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: brand */}
        <Link href="/" className="text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors">
          <span className="tracking-wide">Partycooler</span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/events">
            <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
              Events
            </Button>
          </Link>
          {civicUser ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
                  Dashboard
                </Button>
              </Link>
              <Link href="/tickets">
                <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
                  My Tickets
                </Button>
              </Link>
              {/* Only show Scanner for ORGANIZER or SCANNER roles */}
              {firestoreUser && (firestoreUser.role === "ORGANIZER" || firestoreUser.role === "SCANNER") && (
                <Link href="/scanner">
                  <Button variant="outline" className="border-yellow-400/50 text-yellow-200 bg-black hover:text-white hover:bg-yellow-800/20 hover:border-yellow-400">
                    <Scan className="h-4 w-4 mr-2" />
                    Scanner
                  </Button>
                </Link>
              )}
              <Link href="/events/create">
                <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold rounded-lg transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
              {/* Use Civic's UserButton for profile/logout */}
              <LoginButton />
            </>
          ) : (
            <LoginButton />
          )}
          {/* Mobile menu toggle (visible on small screens only) */}
        </div>

        {/* Mobile right side: hamburger triggers sheet */}
        <div className="md:hidden flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={open ? "Close menu" : "Open menu"}
                className="border-yellow-400/50 text-yellow-200 hover:bg-yellow-800/20 hover:border-yellow-400"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:w-96 bg-black/95 border-yellow-500/20">
              <SheetHeader>
                <SheetTitle className="text-yellow-400">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                {/* Auth control */}
                <div className="py-1">
                  <LoginButton />
                </div>
                <SheetClose asChild>
                  <Link href="/events" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg py-6 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">Events</Button>
                  </Link>
                </SheetClose>
                {civicUser ? (
                  <>
                    <SheetClose asChild>
                      <Link href="/dashboard" onClick={() => setOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg py-6 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">Dashboard</Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/tickets" onClick={() => setOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg py-6 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">My Tickets</Button>
                      </Link>
                    </SheetClose>
                    {/* Only show Scanner for ORGANIZER or SCANNER roles */}
                    {firestoreUser && (firestoreUser.role === "ORGANIZER" || firestoreUser.role === "SCANNER") && (
                      <SheetClose asChild>
                        <Link href="/scanner" onClick={() => setOpen(false)}>
                          <Button variant="outline" className="w-full justify-start text-lg py-6 border-yellow-400/50 text-yellow-200 hover:bg-yellow-800/20 hover:border-yellow-400">
                            <Scan className="h-4 w-4 mr-2" />Scanner
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <Link href="/events/create" onClick={() => setOpen(false)}>
                        <Button className="w-full justify-start text-lg py-6 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold rounded-lg">
                          <Plus className="h-4 w-4 mr-2" />Create Event
                        </Button>
                      </Link>
                    </SheetClose>
                  </>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

    </nav>
  )
}

