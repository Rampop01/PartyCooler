"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useUser } from "@civic/auth/react"
import { type CivicUser } from "@/lib/civic-auth"
import { createUser, getUserByCivicId, type User } from "@/lib/firestore"

interface AuthContextType {
  civicUser: any | null // Using any for now to match Civic Auth's BaseUser type
  firestoreUser: User | null
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: civicUser, isLoading: civicLoading } = useUser()
  const [firestoreUser, setFirestoreUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [civicUser])

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      if (civicUser) {
        // Check if user exists in Firestore, create if not
        let fsUser = await getUserByCivicId(civicUser.id)

        if (!fsUser) {
          // Create new user in Firestore
          const userId = await createUser({
            civicId: civicUser.id,
            email: civicUser.email || "",
            name: civicUser.name || "",
            role: "SCANNER", // Default role - allows scanner access and event creation
          })

          fsUser = await getUserByCivicId(civicUser.id)
        }

        setFirestoreUser(fsUser)
      } else {
        setFirestoreUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    // Login is handled by Civic Auth components (UserButton)
    console.log("Login should be handled by Civic Auth UserButton component")
  }

  const logout = async () => {
    // Logout is handled by Civic Auth components (UserButton)
    console.log("Logout should be handled by Civic Auth UserButton component")
    setFirestoreUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        civicUser,
        firestoreUser,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
