import type { DefaultSession } from 'next-auth'
import type { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      subscriptionTier?: string
      conversationsUsed?: number
      conversationsLimit?: number
    } & DefaultSession['user']
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    subscriptionTier?: string
    conversationsUsed?: number
    conversationsLimit?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    subscriptionTier?: string
    conversationsUsed?: number
    conversationsLimit?: number
  }
}