import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Configurar rate limiting con Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests por hora por defecto
  analytics: true,
})

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/chat', '/profile', '/api/chat', '/api/recommendations']

// Rutas públicas que no necesitan autenticación
const publicRoutes = ['/', '/login', '/register', '/api/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas públicas sin restricciones
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar autenticación para rutas protegidas
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Rate limiting para APIs específicas
    if (pathname.startsWith('/api/chat')) {
      const { success, limit, reset, remaining } = await ratelimit.limit(
        `chat_${token.sub}`
      )

      if (!success) {
        return NextResponse.json(
          { 
            error: 'Too many requests', 
            limit, 
            reset, 
            remaining 
          },
          { status: 429 }
        )
      }

      // Agregar headers de rate limiting
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', limit.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', reset.toString())
      
      return response
    }

    // Rate limiting más permisivo para otras APIs
    if (pathname.startsWith('/api/')) {
      const { success, limit, reset, remaining } = await ratelimit.limit(
        `api_${token.sub}`
      )

      if (!success) {
        return NextResponse.json(
          { 
            error: 'Too many requests', 
            limit, 
            reset, 
            remaining 
          },
          { status: 429 }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}