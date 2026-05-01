import { SignUpButton, SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Link2, Zap, LayoutDashboard } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Shorten Your Links,{' '}
            <span className="text-primary">Amplify Your Reach</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl">
            Create clean, shareable short URLs in seconds. Manage all your
            links from one simple dashboard — free to get started.
          </p>
          <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
            <SignUpButton mode="modal">
              <Button size="lg" className="w-full px-8 sm:w-auto">
                Get Started for Free
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button variant="outline" size="lg" className="w-full px-8 sm:w-auto">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything you need to manage your links
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Instant Shortening</h3>
              <p className="text-sm text-muted-foreground">
                Paste any long URL and get a short, clean link instantly. No
                complicated setup required.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Lightning Fast Redirects</h3>
              <p className="text-sm text-muted-foreground">
                Redirects happen in milliseconds so your audience arrives at
                their destination without delay.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Easy Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage all your shortened links from a single dashboard.
                Update or delete links at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
