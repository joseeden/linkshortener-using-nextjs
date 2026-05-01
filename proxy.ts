import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
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
