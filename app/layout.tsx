import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import "../styles/animations.css"
import { AuthProvider } from "@/contexts/auth-context"
import { CivicAuthProvider } from "@civic/auth/react"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Partycooler - Secure Event Ticketing",
  description: "Partycooler: Secure event ticketing and check-ins powered by Civic Auth",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="bg-black text-white">
        <CivicAuthProvider clientId={process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || "3b7eacd0-77d5-44b6-beef-5754c3a4feff"}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </CivicAuthProvider>
      </body>
    </html>
  )
}
