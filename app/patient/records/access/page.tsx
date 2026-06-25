'use client'
import { ArrowLeft, UserCheck, UserX, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { patientApi } from '@/lib/api'
import { formatDate } from '@/lib/utils/formatters'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'

interface ProviderAccess { provider_id: string; provider_name: string; specialization?: string; granted_at: string; expires_at?: string; resource_types: string[] }

export default function RecordAccessPage() {
  const { data, isLoading, mutate } = useHealthData<{ accesses: ProviderAccess[] }>('/health/records/access')
  const accesses = data?.accesses ?? []
  const [revoking, setRevoking] = useState<string | null>(null)

  const handleRevoke = async (providerId: string) => {
    setRevoking(providerId)
    try {
      await patientApi.revokeAccess(providerId)
      mutate()
    } catch {/* swallow */ }
    setRevoking(null)
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/patient/records" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Records
      </Link>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Provider Access</h1>
          <p className="text-[13px] text-[var(--bb-ink-soft)]">Control who can view your health records</p>
        </div>
      </div>

      {isLoading
        ? <div className="space-y-3">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
        : accesses.length > 0
          ? <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
              {accesses.map(a => (
                <div key={a.provider_id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--h-teal-light)] flex items-center justify-center shrink-0">
                        <UserCheck size={16} color="var(--h-teal)" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{a.provider_name}</p>
                        {a.specialization && <p className="text-[11px] text-[var(--bb-ink-muted)]">{a.specialization}</p>}
                        <p className="text-[11px] text-[var(--bb-ink-muted)] mt-0.5">
                          Granted {formatDate(a.granted_at)}
                          {a.expires_at ? ` · Expires ${formatDate(a.expires_at)}` : ' · No expiry'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleRevoke(a.provider_id)} disabled={revoking === a.provider_id}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-[7px] border border-[var(--h-danger)] text-[var(--h-danger)] text-[11px] font-semibold hover:bg-[var(--h-danger-bg)] transition-colors disabled:opacity-50 shrink-0">
                      <UserX size={12} /> {revoking === a.provider_id ? 'Revoking...' : 'Revoke'}
                    </button>
                  </div>
                  {a.resource_types.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-3 ml-13">
                      {a.resource_types.map(r => (
                        <span key={r} className="chip chip-info text-[10px]">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          : <EmptyHealthState icon={UserCheck} title="No provider access granted" message="When you grant providers access to your records, they will appear here." />
      }

      <div className="bg-[var(--h-info-bg)] border border-[var(--h-info)] rounded-[10px] p-4 text-[12px] text-[var(--bb-ink-soft)]">
        <strong className="text-[var(--h-info)]">How access works:</strong> Providers can only see records you explicitly share with them. Emergency providers may have special access during emergency visits per your signed consent.
      </div>
    </div>
  )
}
