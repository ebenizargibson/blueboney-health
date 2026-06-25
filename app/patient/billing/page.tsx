'use client'
import { CreditCard, ChevronRight, Download } from 'lucide-react'
import Link from 'next/link'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

interface Invoice { id: string; amount: number; currency: string; status: string; due_date?: string; created_at: string; description?: string; provider_name?: string }

export default function BillingPage() {
  const { data, isLoading } = useHealthData<{ invoices?: Invoice[]; transactions?: Invoice[] }>('/health/billing')
  const items = (data as any)?.invoices ?? (data as any)?.transactions ?? []
  const outstanding = items.filter((i: Invoice) => i.status === 'pending' || i.status === 'overdue')
  const totalOwed   = outstanding.reduce((n: number, i: Invoice) => n + (i.amount ?? 0), 0)
  const currency    = outstanding[0]?.currency ?? 'LRD'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Billing & Payments</h1>
        <p className="text-[13px] text-[var(--bb-ink-soft)]">Manage your healthcare invoices and payments</p>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] p-5 flex items-center justify-between gap-4 shadow-[var(--shadow-sm)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bb-ink-muted)]">Outstanding Balance</p>
          <p className="text-[28px] font-extrabold text-[var(--bb-ink)] mt-1">{formatCurrency(totalOwed, currency)}</p>
          <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">{outstanding.length} unpaid invoice{outstanding.length !== 1 ? 's' : ''}</p>
        </div>
        {totalOwed > 0 && (
          <Link href="/patient/wallet"
            className="h-10 px-5 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors flex items-center gap-2">
            <CreditCard size={14} /> Pay Now
          </Link>
        )}
      </div>

      {/* Invoice list */}
      {isLoading
        ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        : items.length > 0
          ? <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
              {items.map((inv: Invoice) => (
                <div key={inv.id} className="flex items-center justify-between gap-4 px-4 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--bb-ink)] truncate">{inv.description ?? 'Medical Invoice'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {inv.provider_name && <p className="text-[11px] text-[var(--bb-ink-muted)] truncate">{inv.provider_name}</p>}
                      <p className="text-[11px] text-[var(--bb-ink-muted)]">{formatDate(inv.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <HealthStatusBadge status={inv.status} />
                    <p className="text-[14px] font-bold text-[var(--bb-ink)]">{formatCurrency(inv.amount, inv.currency)}</p>
                    <button className="text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)] transition-colors">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          : <EmptyHealthState icon={CreditCard} title="No invoices" message="Your billing history will appear here after appointments." />
      }
    </div>
  )
}
