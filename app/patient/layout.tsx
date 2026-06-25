'use client'
import { useState } from 'react'
import { PatientSidebar } from '@/components/layout/PatientSidebar'
import { PatientTopBar } from '@/components/layout/PatientTopBar'
import { MobileNav } from '@/components/layout/MobileNav'
import { usePatientSession } from '@/lib/hooks/usePatientSession'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = usePatientSession()
  const [sidebarCollapsed] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bb-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--h-teal)] animate-pulse" />
          <p className="text-[13px] text-[var(--bb-ink-muted)]">Loading your portal...</p>
        </div>
      </div>
    )
  }

  if (!session) return null // usePatientSession redirects to /login

  return (
    <div className="min-h-screen bg-[var(--bb-bg)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <PatientSidebar />
      </div>

      {/* Top bar */}
      <PatientTopBar session={session} sidebarCollapsed={sidebarCollapsed} />

      {/* Page content */}
      <main
        className="pt-16 pb-20 md:pb-6 transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? 64 : 260 }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
