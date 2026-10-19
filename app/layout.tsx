import type { Metadata, Viewport } from 'next'
import { DM_Mono, Inter } from 'next/font/google'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Downloaded at build time and served from this app's own origin: the browser never calls Google.
const inter = Inter({ weight: ['400', '500', '600', '700', '800'], subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'], display: 'swap', variable: '--font-dm-mono' })

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
    <html lang="en" className={`${inter.variable} ${dmMono.variable}`}>
      <body><ErrorBoundary>{children}</ErrorBoundary></body>
    </html>
  )
}
