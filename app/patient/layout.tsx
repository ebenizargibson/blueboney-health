'use client'
import { useEffect, useState } from 'react'
import { usePatientSession } from '@/lib/hooks/usePatientSession'
import { AccessRefused } from '@/components/health/AccessRefused'
import { onAccessRefused, type AccessRefusal } from '@/lib/accessRefused'
import { HealthOnlyShell } from '@/components/layout/HealthOnlyShell'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = usePatientSession()
  const [refused, setRefused] = useState<AccessRefusal | null>(null)

  // Any request that comes back refused, on any page, replaces the patient area.
  useEffect(() => onAccessRefused(r => setRefused(prev => prev ?? r)), [])

  if (refused) return <AccessRefused refusal={refused} />

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

  // The chart session (P2) is the only session: the banking shell went with the
  // banking sign-in (A2-2a).
  return <HealthOnlyShell fullName={session.fullName}>{children}</HealthOnlyShell>
}
