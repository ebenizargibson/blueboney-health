'use client'
import { ArrowLeft, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge'
import { formatDate, formatCurrency } from '@/lib/utils/formatters'
import { Pagination } from '@/components/shared/Pagination'

interface Claim { id: string; claim_number?: string; claim_date: string; service_date?: string; provider_name?: string; billed_amount: number; covered_amount: number; patient_amount: number; currency?: string; status: string; denial_reason?: string }

export default function ClaimsPage() {
  const [offset, setOffset] = useState(0)
  const limit = 20
  const { data, isLoading } = useHealthData<{ claims: Claim[]; total: number }>(
    '/health/insurance/claims', { limit, offset }
  )
  const claims = data?.claims ?? []
  const total  = data?.total ?? 0

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/patient/insurance" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Insurance
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Claims History</h1>

      {isLoading
        ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        : claims.length > 0
          ? <>
              <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
                {claims.map(c => (
                  <div key={c.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div>
                        {c.claim_number && <p className="text-[11px] text-[var(--bb-ink-muted)]">#{c.claim_number}</p>}
                        <p className="text-[13px] font-semibold text-[var(--bb-ink)]">
                          {c.provider_name ?? 'Provider'}
                        </p>
                        <p className="text-[11px] text-[var(--bb-ink-muted)]">
                          Filed {formatDate(c.claim_date)}
                          {c.service_date && ` · Service ${formatDate(c.service_date)}`}
                        </p>
                      </div>
                      <HealthStatusBadge status={c.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      {[
                        { label: 'Billed',    val: c.billed_amount  },
                        { label: 'Covered',   val: c.covered_amount },
                        { label: 'Your share',val: c.patient_amount },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-[var(--bb-bg)] rounded-[6px] p-2">
                          <p className="text-[10px] text-[var(--bb-ink-muted)]">{label}</p>
                          <p className="text-[12px] font-bold text-[var(--bb-ink)]">{formatCurrency(val, c.currency ?? 'LRD')}</p>
                        </div>
                      ))}
                    </div>
                    {c.denial_reason && (
                      <p className="text-[12px] text-[var(--h-danger)] mt-2">Denial reason: {c.denial_reason}</p>
                    )}
                  </div>
                ))}
              </div>
              {total > limit && <Pagination offset={offset} limit={limit} total={total} onChange={setOffset} />}
            </>
          : <EmptyHealthState icon={FileCheck} title="No claims on file" message="Your insurance claims will appear here after services are rendered." />
      }
    </div>
  )
}
