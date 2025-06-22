import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'
import { WRDOProvider } from '@/lib/wrdo-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WRDO Cave Ultra - Autonomous AI Operations Platform',
  description: 'Advanced AI-powered operations platform with autonomous agents, intelligent automation, comprehensive business intelligence, and enterprise-grade security',
  keywords: 'AI, operations, automation, analytics, enterprise, security, autonomous agents, business intelligence',
  authors: [{ name: 'WRDO Cave Ultra Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1e293b" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="WRDO Cave Ultra - The most advanced autonomous AI operations platform for enterprise business intelligence and automation" />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-900 antialiased`}>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="dark" storageKey="wrdo-cave-ultra-theme">
            {children}
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
