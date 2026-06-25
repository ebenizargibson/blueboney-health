'use client'
import { useState } from 'react'
import { FlaskConical, ChevronDown, ChevronRight } from 'lucide-react'
import { LabResultRow } from '@/components/health/LabResultRow'
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge'
import { MetricChart } from '@/components/health/MetricChart'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { Pagination } from '@/components/shared/Pagination'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { formatDate } from '@/lib/utils/formatters'
import type { LabInterpretation } from '@/lib/utils/health'

interface LabResult { test_name: string; value: string; unit: string; reference_range?: string; interpretation?: string; comment?: string }
interface LabOrder { id: string; test_name: string; status: string; ordered_at: string; resulted_at?: string; lab_name?: string; results?: LabResult[] }

export default function LabsPage() {
  const [offset, setOffset] = useState(0)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const LIMIT = 10
  const { data, isLoading } = useHealthData<{ orders: LabOrder[]; count: number }>('/health/labs', { limit: LIMIT, offset })
  const orders = data?.orders ?? []
  const total  = data?.count ?? 0

  const hasCritical = orders.some(o => o.results?.some(r => r.interpretation === 'critical'))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Lab Results</h1>
        <p className="text-[13px] text-[var(--bb-ink-soft)]">Your laboratory orders and results</p>
      </div>

      {hasCritical && (
        <div className="alert alert-critical flex items-center gap-2">
          <FlaskConical size={14} /> Critical lab values detected — contact your provider immediately.
        </div>
      )}

      {isLoading
        ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        : orders.length > 0
          ? <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-[12px] border border-[var(--bb-border)]">
                  <button
                    onClick={() => setExpanded(p => ({ ...p, [order.id]: !p[order.id] }))}
                    className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[8px] bg-[var(--h-warning-bg)] flex items-center justify-center shrink-0">
                        <FlaskConical size={16} color="var(--h-warning)" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{order.test_name}</p>
                        <p className="text-[11px] text-[var(--bb-ink-muted)]">
                          {order.lab_name && `${order.lab_name} · `}
                          {order.resulted_at ? `Resulted ${formatDate(order.resulted_at)}` : `Ordered ${formatDate(order.ordered_at)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <HealthStatusBadge status={order.status} />
                      {expanded[order.id] ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </div>
                  </button>
                  {expanded[order.id] && order.results && order.results.length > 0 && (
                    <div className="px-4 pb-4">
                      {order.results.map((r, i) => (
                        <LabResultRow
                          key={i}
                          name={r.test_name}
                          value={r.value}
                          unit={r.unit}
                          refRange={r.reference_range}
                          interpretation={(r.interpretation ?? 'normal') as LabInterpretation}
                          comment={r.comment}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          : <EmptyHealthState icon={FlaskConical} title="No lab results" message="Your laboratory orders and results will appear here." />
      }
      {total > LIMIT && <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />}
    </div>
  )
}
