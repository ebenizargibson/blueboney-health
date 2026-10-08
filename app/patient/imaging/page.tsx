'use client'
import { useState } from 'react'
import { ScanLine, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { Pagination } from '@/components/shared/Pagination'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { formatDate } from '@/lib/utils/formatters'
import { AWAITING_REVIEW, isPending, type ImagingOrder } from '@/lib/utils/results'

export default function ImagingPage() {
  const [offset, setOffset] = useState(0)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const LIMIT = 10

  const { data, isLoading } = useHealthData<{ orders: ImagingOrder[]; total: number }>(
    '/health/imaging', { limit: LIMIT, offset },
  )
  const orders = data?.orders ?? []
  const total  = data?.total  ?? 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Imaging</h1>
        <p className="text-[13px] text-[var(--bb-ink-soft)]">Your radiology orders and reports</p>
      </div>

      {isLoading
        ? <div className="space-y-3">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
        : orders.length > 0
          ? (
            <div className="space-y-3">
              {orders.map(order => {
                const report = order.health_imaging_reports?.[0]
                return (
                <div key={order.id} className="bg-white rounded-[12px] border border-[var(--bb-border)]">
                  <button
                    onClick={() => setExpanded(p => ({ ...p, [order.id]: !p[order.id] }))}
                    className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[8px] bg-[var(--h-info-bg,#EFF6FF)] flex items-center justify-center shrink-0">
                        <ScanLine size={16} color="var(--h-info,#3B82F6)" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[var(--bb-ink)]">
                          {order.modality ?? 'Imaging Study'}
                          {order.body_part ? ` — ${order.body_part}` : ''}
                        </p>
                        <p className="text-[11px] text-[var(--bb-ink-muted)]">
                          {order.imaging_provider?.name && `${order.imaging_provider.name} · `}
                          {order.scheduled_at
                            ? `Scheduled ${formatDate(order.scheduled_at)}`
                            : `Ordered ${formatDate(order.ordered_at)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <HealthStatusBadge status={order.status} />
                      {report && (expanded[order.id] ? <ChevronDown size={15} /> : <ChevronRight size={15} />)}
                    </div>
                  </button>

                  {expanded[order.id] && report && (
                    <div className="px-4 pb-4 border-t border-[var(--bb-border)] pt-3 space-y-3">
                      {isPending(report)
                        ? <p className="text-[13px] font-medium text-[var(--bb-ink-muted)]">{AWAITING_REVIEW}</p>
                        : <>
                          {report.reported_at && (
                            <p className="text-[12px] text-[var(--bb-ink-muted)]">Reported {formatDate(report.reported_at)}</p>
                          )}
                          {report.impression && (
                            <div>
                              <p className="text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1">Impression</p>
                              <p className="text-[13px] text-[var(--bb-ink)] leading-relaxed">{report.impression}</p>
                            </div>
                          )}
                          {report.findings && (
                            <div>
                              <p className="text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1">Findings</p>
                              <p className="text-[13px] text-[var(--bb-ink)] leading-relaxed">{report.findings}</p>
                            </div>
                          )}
                        </>}
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          )
          : <EmptyHealthState icon={ScanLine} title="No imaging studies" message="Your radiology orders and reports will appear here." />
      }
      {total > LIMIT && <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />}
    </div>
  )
}
