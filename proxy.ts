import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
const isRateLimitedRoute = createRouteMatcher(['/api/redirect/(.*)'])

// In-memory rate limit store (best-effort; resets per edge instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30 // max requests per window
const RATE_WINDOW_MS = 60_000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) {
    return true
  }
  entry.count++
  return false
}

export default clerkMiddleware(async (auth, req) => {
  // Rate-limit unauthenticated access to the public redirect endpoint
  if (isRateLimitedRoute(req)) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    if (checkRateLimit(ip)) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }

  const { userId } = await auth()
  const { pathname } = req.nextUrl

  // Redirect authenticated users away from the home page
  if (userId && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect /dashboard and sub-routes — redirect to home (sign-in modal) if not authenticated
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
