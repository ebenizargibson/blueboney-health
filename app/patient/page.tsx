'use client'
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton'
import { HealthRecordHome } from '@/components/health/HealthRecordHome'
import { usePatientSession } from '@/lib/hooks/usePatientSession'

/**
 * The patient's home is their chart's (P2). The banking dashboard, every request
 * of which read a banking session, went with the banking sign-in (A2-2a).
 */
export default function DashboardPage() {
  const { session, loading } = usePatientSession()
  if (loading || !session) return <DashboardSkeleton />
  return <HealthRecordHome patientId={session.healthPatientId} />
}
