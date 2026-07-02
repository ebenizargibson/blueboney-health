import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Blue Boney Health',
  description: 'Your personal health portal — appointments, records, medications, and more.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Blue Boney Health',
    description: 'Secure patient portal for Blue Boney Health.',
    siteName: 'Blue Boney Health',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0891B2',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><ErrorBoundary>{children}</ErrorBoundary></body>
    </html>
  )
}
