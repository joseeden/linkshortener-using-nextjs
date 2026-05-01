# Authentication

## Overview

All authentication in this project is handled exclusively by **Clerk**. No other authentication methods, libraries, or custom implementations should be used.

## Rules

- **Clerk is the only auth provider.** Do not add custom JWT handling, NextAuth, or any other authentication mechanism.
- **Sign-in and sign-up must always open as a Clerk modal.** Never route users to a standalone `/sign-in` or `/sign-up` page.
- **`/dashboard` is a protected route.** Users must be authenticated to access it. Unauthenticated users are redirected to the home page (sign-in modal is shown).
- **Authenticated users visiting `/` are redirected to `/dashboard`.**

---

## Route Protection

Route-level auth is enforced in `proxy.ts` using Clerk's middleware. This is the only place where redirect logic lives — do not duplicate it in page components.

```ts
// proxy.ts
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

  // Protect /dashboard and sub-routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
```

---

## Sign-in / Sign-up Modals

Clerk modals are triggered by rendering `<SignInButton>` or `<SignUpButton>` with `mode="modal"`. Never link directly to `/sign-in` or `/sign-up`.

```tsx
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

// Correct — opens modal
<SignInButton mode="modal">
  <Button>Sign in</Button>
</SignInButton>

<SignUpButton mode="modal">
  <Button variant="outline">Sign up</Button>
</SignUpButton>
```

Do **not** do this:

```tsx
// Wrong — navigates to a separate page
<Link href="/sign-in">Sign in</Link>
```

---

## Accessing the Current User

### Server Components / Server Actions

```ts
import { auth, currentUser } from '@clerk/nextjs/server'

// Get userId only (lightweight)
const { userId } = await auth()

// Get full user object
const user = await currentUser()
```

### Client Components

```tsx
'use client'
import { useAuth, useUser } from '@clerk/nextjs'

const { userId, isLoaded } = useAuth()
const { user } = useUser()
```

---

## ClerkProvider

`ClerkProvider` is mounted once in `app/layout.tsx`. Do not add it anywhere else.

The `shadcn` theme from `@clerk/themes` is applied so that Clerk UI components match the shadcn/ui design system.

```tsx
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/themes'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

---

## Environment Variables

Clerk requires these variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Never commit these values. Never hard-code them.
