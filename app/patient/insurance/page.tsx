'use client'
import { Shield, Plus, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { formatDate } from '@/lib/utils/formatters'

interface Policy { id: string; insurer_name: string; policy_number: string; plan_name?: string; status: string; effective_date?: string; expiry_date?: string; is_primary?: boolean; copay_amount?: number; currency?: string }

export default function InsurancePage() {
  const { data: polData, isLoading: polLoading } = useHealthData<{ policies: Policy[] }>('/health/insurance/policies')
  const { data: claimData, isLoading: claimLoading } = useHealthData<{ claims: { id: string; amount: number; currency: string; status: string; service_date: string; description?: string }[] }>('/health/insurance/claims', { limit: 5 })
  const policies = polData?.policies ?? []
  const claims   = claimData?.claims ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Insurance</h1>
          <p className="text-[13px] text-[var(--bb-ink-soft)]">Your coverage and claims</p>
        </div>
        <Link href="/patient/insurance/add"
          className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors">
          <Plus size={15} /> Add Policy
        </Link>
      </div>

      {/* Policies */}
      <section>
        <h2 className="text-[15px] font-bold text-[var(--bb-ink)] mb-3">Coverage</h2>
        {polLoading
          ? <div className="space-y-3">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
          : policies.length > 0
            ? <div className="space-y-3">
                {policies.map(p => (
                  <div key={p.id} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[16px] font-bold text-[var(--bb-ink)]">{p.insurer_name}</p>
                          {p.is_primary && <span className="chip chip-teal text-[10px]">Primary</span>}
                        </div>
                        {p.plan_name && <p className="text-[13px] text-[var(--bb-ink-soft)]">{p.plan_name}</p>}
                        <p className="text-[11px] text-[var(--bb-ink-muted)] mt-0.5 font-mono">ID: {p.policy_number}</p>
                      </div>
                      <HealthStatusBadge status={p.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {p.effective_date && (
                        <div className="bg-[var(--bb-bg2)] rounded-[8px] p-2.5">
                          <p className="text-[10px] text-[var(--bb-ink-muted)] uppercase tracking-wide">Effective</p>
                          <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{formatDate(p.effective_date)}</p>
                        </div>
                      )}
                      {p.expiry_date && (
                        <div className="bg-[var(--bb-bg2)] rounded-[8px] p-2.5">
                          <p className="text-[10px] text-[var(--bb-ink-muted)] uppercase tracking-wide">Expires</p>
                          <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{formatDate(p.expiry_date)}</p>
                        </div>
                      )}
                      {p.copay_amount !== undefined && (
                        <div className="bg-[var(--bb-bg2)] rounded-[8px] p-2.5">
                          <p className="text-[10px] text-[var(--bb-ink-muted)] uppercase tracking-wide">Copay</p>
                          <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{p.currency ?? 'LRD'} {p.copay_amount}</p>
                        </div>
                      )}
                    </div>
                    <Link href="/patient/insurance/claims"
                      className="flex items-center gap-1 mt-3 text-[12px] text-[var(--h-teal)] font-medium hover:underline">
                      View Claims <ChevronRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            : <EmptyHealthState icon={Shield} title="No insurance on file" message="Add your insurance policy to enable claims and coverage tracking." action={{ label: 'Add Policy', onClick: () => window.location.href = '/patient/insurance/add' }} />
        }
      </section>

      {/* Recent claims */}
      {claims.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-[var(--bb-ink)]">Recent Claims</h2>
            <Link href="/patient/insurance/claims" className="text-[12px] text-[var(--h-teal)] font-medium hover:underline">All claims</Link>
          </div>
          <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
            {claims.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-[var(--bb-ink)]">{c.description ?? 'Medical Claim'}</p>
                  <p className="text-[11px] text-[var(--bb-ink-muted)]">{formatDate(c.service_date)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <HealthStatusBadge status={c.status} />
                  <p className="text-[13px] font-bold text-[var(--bb-ink)]">{c.currency} {c.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
