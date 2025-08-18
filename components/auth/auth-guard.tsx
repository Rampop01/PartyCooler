"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { LoginButton } from "./login-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "ATTENDEE" | "ORGANIZER" | "SCANNER"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { civicUser, firestoreUser, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!civicUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-yellow-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Welcome to Partycooler</CardTitle>
            <CardDescription className="text-gray-300">Secure event ticketing and check-ins powered by Civic Auth</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LoginButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requiredRole && firestoreUser && firestoreUser.role !== requiredRole && requiredRole !== "SCANNER") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-yellow-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-red-400">Access Denied</CardTitle>
            <CardDescription className="text-gray-300">
              You don't have permission to access this page. Required role: {requiredRole}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
