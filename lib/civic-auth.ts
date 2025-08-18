// Client ID for Civic Auth
export const CIVIC_CLIENT_ID = process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || ""

export interface CivicUser {
  id: string
  email: string
  name: string
  verified: boolean
}

// This function is deprecated - use useUser hook from @civic/auth/react instead
export const getCivicUser = async (): Promise<CivicUser | null> => {
  console.warn("getCivicUser is deprecated. Use useUser hook from @civic/auth/react instead.")
  return null
}
