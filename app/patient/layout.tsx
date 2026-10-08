'use client'
import { useEffect, useState } from 'react'
import { PatientSidebar } from '@/components/layout/PatientSidebar'
import { PatientTopBar } from '@/components/layout/PatientTopBar'
import { MobileNav } from '@/components/layout/MobileNav'
import { usePatientSession } from '@/lib/hooks/usePatientSession'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { AccessRefused } from '@/components/health/AccessRefused'
import { onAccessRefused, type AccessRefusal, type HealthRequestError } from '@/lib/accessRefused'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = usePatientSession()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [refused, setRefused] = useState<AccessRefusal | null>(null)

  // Any request that comes back refused, on any page, replaces the patient area.
  useEffect(() => onAccessRefused(r => setRefused(prev => prev ?? r)), [])

  // Asked before any page renders, so a refused account never sees the
  // activation form or a dashboard flash first.
  const { error: statusError, isLoading: statusLoading } = useHealthData<{ activated: boolean }>(
    session ? '/health/status' : null,
  )
  const statusRefusal = (statusError as HealthRequestError | undefined)?.refusal ?? null
  const refusal = refused ?? statusRefusal

  const { data: msgData } = useHealthData<{ threads: { unread_count?: number }[] }>(
    session && !statusLoading && !refusal ? '/health/messages/threads' : null,
  )
  const unreadMessages = (msgData?.threads ?? []).reduce((n, t) => n + (t.unread_count ?? 0), 0)

  if (refusal) return <AccessRefused refusal={refusal} />

  if (loading || (session && statusLoading)) {
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
        <PatientSidebar
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          unreadMessages={unreadMessages}
        />
      </div>

      {/* Top bar */}
      <PatientTopBar session={session} sidebarCollapsed={sidebarCollapsed} />

      {/* Page content — margin tracks sidebar width on md+; no margin on mobile */}
      <main
        className={`pt-16 pb-20 md:pb-6 transition-all duration-200 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-[260px]'}`}
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
