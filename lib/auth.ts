import { NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { LoginSchema } from './validations'
import './auth-types'

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const { email, password } = LoginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user || !user.passwordHash) {
            return null
          }

          const isValidPassword = await bcrypt.compare(password, user.passwordHash)
          
          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    })
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        
        // Obtener información adicional del usuario desde la base de datos
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            subscriptionTier: true,
            conversationsUsed: true,
            conversationsLimit: true,
          }
        })
        
        if (dbUser) {
          token.subscriptionTier = dbUser.subscriptionTier
          token.conversationsUsed = dbUser.conversationsUsed
          token.conversationsLimit = dbUser.conversationsLimit
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.subscriptionTier = token.subscriptionTier as string
        session.user.conversationsUsed = token.conversationsUsed as number
        session.user.conversationsLimit = token.conversationsLimit as number
      }
      return session
    },
    async signIn() {
      // Permitir sign in para todos los providers configurados
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirigir después del login
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard/chat`
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  events: {
    async createUser({ user }) {
      // Inicializar perfil de usuario después de registro
      console.log(`New user created: ${user.email}`)
    },
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user signed in: ${user.email}`)
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
}

// Configurar y exportar las funciones de auth
import NextAuth from 'next-auth'

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)