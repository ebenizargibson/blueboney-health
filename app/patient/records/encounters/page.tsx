'use client'
import { ArrowLeft, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge'
import { formatDate } from '@/lib/utils/formatters'
import { Pagination } from '@/components/shared/Pagination'
import { useState } from 'react'

interface Encounter { id: string; encounter_type: string; status: string; encounter_date: string; provider_name?: string; facility_name?: string; chief_complaint?: string; assessment_notes?: string }

export default function EncountersPage() {
  const [offset, setOffset] = useState(0)
  const limit = 20
  const { data, isLoading } = useHealthData<{ encounters: Encounter[]; total: number }>(
    '/health/records/encounters', { limit, offset }
  )
  const encounters = data?.encounters ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/patient/records" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Records
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Encounters</h1>

      {isLoading
        ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        : encounters.length > 0
          ? <>
              <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
                {encounters.map(e => (
                  <div key={e.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--bb-ink)] capitalize">{e.encounter_type.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] text-[var(--bb-ink-muted)]">
                          {formatDate(e.encounter_date)}
                          {e.provider_name && ` · ${e.provider_name}`}
                          {e.facility_name && ` · ${e.facility_name}`}
                        </p>
                      </div>
                      <HealthStatusBadge status={e.status} />
                    </div>
                    {e.chief_complaint   && <p className="text-[12px] text-[var(--bb-ink-soft)]"><span className="font-medium">Chief complaint:</span> {e.chief_complaint}</p>}
                    {e.assessment_notes  && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-1">{e.assessment_notes}</p>}
                  </div>
                ))}
              </div>
              {total > limit && (
                <Pagination offset={offset} limit={limit} total={total} onChange={setOffset} />
              )}
            </>
          : <EmptyHealthState icon={Stethoscope} title="No encounters recorded" message="Your clinic visits, telehealth sessions, and hospital stays will appear here." />
      }
    </div>
  )
}
