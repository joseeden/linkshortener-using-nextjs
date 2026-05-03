import type { Metadata } from "next";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { Button } from "@/components/ui/button";
import { Roboto, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinkShortener",
  description: "Create and manage short links",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head />
      <body className={`min-h-full flex flex-col ${roboto.variable} ${geistMono.variable}`}>
        <ClerkProvider
          appearance={{
            theme: shadcn,
            elements: {
              modalBackdrop: { background: 'rgba(0,0,0,0.4)' },
            },
          }}
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
        >
          <ThemeProvider>
            <header className="flex justify-between items-center p-4 h-16">
              <span className="font-semibold text-lg">Link Shortener</span>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Show when="signed-out">
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button variant="ghost">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button>Sign Up</Button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </header>
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
