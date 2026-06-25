'use client'
import { ArrowLeft, Activity } from 'lucide-react'
import Link from 'next/link'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge'
import { formatDate } from '@/lib/utils/formatters'

interface Condition { id: string; code_display?: string; icd10_code?: string; status: string; onset_date?: string; provider_name?: string; notes?: string }

export default function ConditionsPage() {
  const { data, isLoading } = useHealthData<{ conditions: Condition[] }>('/health/records/conditions')
  const conditions = data?.conditions ?? []

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/patient/records" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Records
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Medical Conditions</h1>

      {isLoading
        ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        : conditions.length > 0
          ? <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
              {conditions.map(c => (
                <div key={c.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{c.code_display ?? 'Unknown condition'}</p>
                      {c.icd10_code && <p className="text-[11px] font-mono text-[var(--bb-ink-muted)] mt-0.5">ICD-10: {c.icd10_code}</p>}
                    </div>
                    <HealthStatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--bb-ink-muted)]">
                    {c.onset_date   && <span>Onset: {formatDate(c.onset_date)}</span>}
                    {c.provider_name && <span>· {c.provider_name}</span>}
                  </div>
                  {c.notes && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-2">{c.notes}</p>}
                </div>
              ))}
            </div>
          : <EmptyHealthState icon={Activity} title="No conditions recorded" message="Your diagnosed conditions will appear here when added by your care team." />
      }
    </div>
  )
}
