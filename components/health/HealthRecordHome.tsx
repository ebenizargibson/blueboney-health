'use client'
import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton'
import { ChartSummary, type ClinicalSummary } from '@/components/health/ChartSummary'

interface Me {
  patient: { id: string; uhr_number: string; given_name: string; family_name: string }
  dependants: {
    chart: { id: string; uhr_number?: string; given_name?: string; family_name?: string }
    relationship: { relationship_id: string; basis: string; status: string; scopes: string[]; valid_until: string | null }
  }[]
}

const STATUS_TEXT: Record<string, string> = {
  active:       '',
  under_review: 'Access is under review. Please contact the clinic.',
  expired:      'Access has ended.',
}

/**
 * Home for a patient signed in with their health record and no banking account
 * (P2): their own chart, and the children or others they act for as a guardian.
 */
export function HealthRecordHome({ patientId }: { patientId: string }) {
  const { data: me, isLoading } = useHealthData<Me>('/health/patient/me')
  const { data: own } = useHealthData<{ summary: ClinicalSummary }>(`/health/patient/charts/${patientId}/summary`)

  if (isLoading || !me) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Your health record</h1>
        <p className="text-[13px] text-[var(--bb-ink-muted)] mt-1">
          {me.patient.given_name} {me.patient.family_name} · Record number <span className="font-mono">{me.patient.uhr_number}</span>
        </p>
      </div>

      {own ? <ChartSummary summary={own.summary} /> : <DashboardSkeleton />}

      <section className="bg-white rounded-[14px] border border-[var(--bb-border)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-[var(--h-teal)]" />
          <h2 className="text-[14px] font-bold text-[var(--bb-ink)]">People you look after</h2>
        </div>
        {me.dependants.length === 0 ? (
          <p className="text-[13px] text-[var(--bb-ink-muted)]">
            None. If you are a parent or guardian, the clinic desk can record it with you.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--bb-border)]">
            {me.dependants.map(d => {
              const name = [d.chart.given_name, d.chart.family_name].filter(Boolean).join(' ') || 'Record'
              const usable = d.relationship.status === 'active' && d.relationship.scopes.includes('view')
              const row = (
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{name}</p>
                    <p className="text-[12px] text-[var(--bb-ink-muted)]">
                      {STATUS_TEXT[d.relationship.status] ?? ''}
                      {usable && d.relationship.valid_until ? `Until ${d.relationship.valid_until.slice(0, 10)}` : ''}
                    </p>
                  </div>
                  {usable && <ChevronRight size={16} className="text-[var(--bb-ink-muted)]" />}
                </div>
              )
              return (
                <li key={d.relationship.relationship_id}>
                  {usable ? <Link href={`/patient/charts/${d.chart.id}`}>{row}</Link> : row}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
