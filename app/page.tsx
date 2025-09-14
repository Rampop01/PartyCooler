"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getAllEvents, type Event } from "@/lib/firestore"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Zap, Shield, QrCode, Sparkles, ArrowRight, Users, Ticket, Plus } from "lucide-react"
import type { Timestamp } from "firebase/firestore"
import { motion, useScroll, useTransform } from "framer-motion"

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { civicUser, firestoreUser } = useAuth()

  // Scroll-linked motion values
  const { scrollYProgress } = useScroll()
  // Subtle global gradient shimmer opacity
  const shimmerOpacity = useTransform(scrollYProgress, [0, 1], [0.05, 0.2])
  // Parallax amounts for floating orbs
  const parallaxSmall = useTransform(scrollYProgress, [0, 1], [0, -80])
  const parallaxMedium = useTransform(scrollYProgress, [0, 1], [0, -120])
  const parallaxLarge = useTransform(scrollYProgress, [0, 1], [0, -160])

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const eventList = await getAllEvents()
      // Sort by createdAt descending (newest first)
      const sorted = eventList.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
      setEvents(sorted)
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dxswouxj5/image/upload/v1755427289/SL_081919_22630_05_nwzuj1.jpg)'
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/60"></div>
          {/* Scroll-linked subtle gradient shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent pointer-events-none"
            style={{ opacity: shimmerOpacity }}
          />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Orbs */}
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full blur-xl"
            style={{ y: parallaxLarge }}
          />
          <motion.div
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-amber-500/30 to-yellow-600/30 rounded-full blur-lg"
            style={{ y: parallaxMedium }}
          />
          <motion.div
            className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-yellow-400/15 to-amber-400/15 rounded-full blur-2xl"
            style={{ y: parallaxSmall }}
          />
          
          {/* Floating Particles */}
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-1/2 left-1/5 w-1 h-1 bg-amber-400 rounded-full animate-ping delay-700"></div>
          <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-bounce delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full blur opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-yellow-500 to-amber-500 p-4 rounded-full">
                  <Ticket className="h-12 w-12 text-black" />
                </div>
              </div>
            </div> */}
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent animate-gradient-x">
                Partycooler
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-200">
              Secure, Web3-powered event ticketing with QR code validation and Civic Auth integration
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
              {!civicUser ? (
                <>
                  <Link href="/login">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold px-8 py-3 rounded-xl shadow-sm transition-colors duration-300"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Login / Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold px-8 py-4 rounded-xl shadow-sm transition-colors duration-300">
                      <Zap className="mr-2 h-5 w-5" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/tickets">
                    <Button size="lg" variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 px-8 py-4 rounded-xl transition-colors duration-300">
                      <Ticket className="mr-2 h-5 w-5" />
                      My Tickets
                    </Button>
                  </Link>
                  {/* Only show Scan Tickets for ORGANIZER or SCANNER roles */}
                  {firestoreUser && (firestoreUser.role === "ORGANIZER" || firestoreUser.role === "SCANNER") && (
                    <Link href="/scanner">
                      <Button size="lg" variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 px-8 py-4 rounded-xl transition-colors duration-300">
                        <QrCode className="mr-2 h-5 w-5" />
                        Scan Tickets
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent mb-4 animate-gradient-x">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 animate-fade-in-up delay-200">
              Simple, secure, and seamless event management in 4 easy steps
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line (desktop only) */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></div>
            
            <div className="space-y-16">
              {/* Step 1 */}
              <motion.div
                className="relative md:flex items-center pl-6 border-l border-yellow-500/30 md:border-0 md:pl-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* Mobile dot */}
                <span className="absolute -left-1.5 top-2 h-3 w-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 md:hidden"></span>
                <div className="md:flex-1 md:text-right md:pl-16">
                  <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6 transition-colors duration-300 md:ml-auto md:max-w-xl">
                    <h3 className="text-2xl font-bold text-white mb-2">1. Connect with Civic Auth</h3>
                    <p className="text-gray-300">Secure Web3 authentication using your email, Google account, or crypto wallet. No passwords needed.</p>
                  </div>
                </div>
                <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full items-center justify-center text-black font-bold text-xl z-10 animate-glow-pulse">
                  1
                </div>
                <div className="hidden md:flex-1 md:pl-8"></div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                className="relative md:flex items-center pl-6 border-l border-yellow-500/30 md:border-0 md:pl-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Mobile dot */}
                <span className="absolute -left-1.5 top-2 h-3 w-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 md:hidden"></span>
                <div className="hidden md:flex-1 md:pr-16"></div>
                <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full items-center justify-center text-black font-bold text-xl z-10 animate-glow-pulse">
                  2
                </div>
                <div className="md:flex-1 md:text-left md:pr-16">
                  <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6 transition-colors duration-300 md:mr-auto md:max-w-xl">
                    <h3 className="text-2xl font-bold text-white mb-2">2. Create Your Event</h3>
                    <p className="text-gray-300">Set up your event details, date, location, and description. Our platform handles all the technical setup.</p>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                className="relative md:flex items-center pl-6 border-l border-yellow-500/30 md:border-0 md:pl-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Mobile dot */}
                <span className="absolute -left-1.5 top-2 h-3 w-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 md:hidden"></span>
                <div className="md:flex-1 md:text-right md:pl-16">
                  <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6 transition-colors duration-300 md:ml-auto md:max-w-xl">
                    <h3 className="text-2xl font-bold text-white mb-2">3. Share & Register</h3>
                    <p className="text-gray-300">Share your event link. Attendees register instantly and receive unique QR code tickets via blockchain technology.</p>
                  </div>
                </div>
                <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full items-center justify-center text-black font-bold text-xl z-10 animate-glow-pulse">
                  3
                </div>
                <div className="hidden md:flex-1 md:pl-8"></div>
              </motion.div>

              {/* Step 4 */}
              <motion.div
                className="relative md:flex items-center pl-6 border-l border-yellow-500/30 md:border-0 md:pl-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {/* Mobile dot */}
                <span className="absolute -left-1.5 top-2 h-3 w-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 md:hidden"></span>
                <div className="hidden md:flex-1 md:pr-8"></div>
                <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full items-center justify-center text-black font-bold text-xl z-10 animate-glow-pulse">
                  4
                </div>
                <div className="md:flex-1 md:text-left md:pr-16">
                  <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6 transition-colors duration-300 md:mr-auto md:max-w-xl">
                    <h3 className="text-2xl font-bold text-white mb-2">4. Scan & Check-In</h3>
                    <p className="text-gray-300">Use our built-in QR scanner to validate tickets instantly. Real-time attendance tracking and analytics included.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Web3 Civic Auth Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent mb-4">
              Powered by Web3 & Civic Auth
            </h2>
            <p className="text-xl text-gray-300">
              Next-generation security meets seamless user experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-8"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-3 rounded-xl mr-4">
                    <Shield className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Civic Auth Integration</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Login with your email, Google account, or crypto wallet. Civic Auth provides military-grade security 
                  without the complexity of traditional Web3 authentication.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    No seed phrases or private keys to manage
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Automatic Web3 wallet creation
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Enterprise-grade security standards
                  </li>
                </ul>
              </motion.div>

              <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-3 rounded-xl mr-4">
                    <QrCode className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Blockchain-Ready Tickets</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Every ticket is cryptographically secured and can be easily extended to full blockchain integration. 
                  Future-proof your events with Web3 technology.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Tamper-proof QR codes
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Ready for NFT ticket upgrades
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Cross-platform compatibility
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <motion.div
                className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-8 text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-yellow-500 to-amber-500 p-6 rounded-full">
                      <Sparkles className="h-16 w-16 text-black" />
                    </div>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">The Future is Here</h3>
                <p className="text-gray-300 mb-8">
                  Experience the next generation of event management with Web3 security, 
                  seamless authentication, and blockchain-ready infrastructure.
                </p>
                {!civicUser && (
                  <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold px-8 py-4 rounded-xl shadow-sm transition-colors duration-300 animate-shimmer">
                    <Zap className="mr-2 h-5 w-5" />
                    Try It Now
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section - Preview */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up">
              Featured Events
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up delay-200">
              Discover amazing events happening near you
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : !civicUser ? (
            <div className="text-center py-16">
              <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-12 max-w-md mx-auto">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Login or Sign Up to View Events</h3>
                <p className="text-gray-300 mb-8">Please log in or create an account to see and register for available events.</p>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold">
                    Login / Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-12 max-w-md mx-auto">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No Events Available</h3>
                <p className="text-gray-300 mb-8">Be the first to create an event and bring people together!</p>
                {civicUser && (
                  <Link href="/events/create">
                    <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {events.slice(0, 3).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.15 }}
                  >
                  <Card 
                    className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 transition-colors duration-300 group"
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-semibold text-white group-hover:text-yellow-200 transition-colors">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="text-gray-300 line-clamp-2">
                        {event.description}
                      </CardDescription>
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
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.4 }}
              >
                <Link href="/events">
                  <Button 
                    variant="outline" 
                    className="border-yellow-500 text-yellow-400 bg-black hover:text-white hover:bg-yellow-500/10 px-8 py-3 rounded-xl  duration-300"
                  >
                    View more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        className="relative border-t border-yellow-500/20"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Partycooler</h3>
            <p className="text-gray-300 mb-8">Next-generation event ticketing platform</p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <span>Powered by Civic Auth</span>
              <span>•</span>
              <span>Secured by Web3</span>
              <span>•</span>
              <span>Built for the Future</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
