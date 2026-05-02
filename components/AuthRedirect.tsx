'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  // Render nothing until Clerk has loaded and confirmed the user is NOT signed in.
  // This prevents page content from painting during the post-modal redirect.
  if (!isLoaded || isSignedIn) return null

  return <>{children}</>
}
