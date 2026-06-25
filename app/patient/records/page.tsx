'use client'
import { useState } from 'react'
import { FileText, Download, Lock } from 'lucide-react'
import { TimelineEvent } from '@/components/health/TimelineEvent'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { formatDate } from '@/lib/utils/formatters'
import Link from 'next/link'

interface Encounter  { id: string; visit_type?: string; chief_complaint?: string; encounter_date: string; provider_name?: string }
interface Condition  { id: string; name: string; status: string; onset_date?: string; provider_name?: string }
interface Referral   { id: string; specialty?: string; reason?: string; referred_at: string; provider_name?: string }

export default function RecordsPage() {
  const { data: encData, isLoading: encLoading } = useHealthData<{ encounters: Encounter[] }>('/health/records/encounters', { limit: 20 })
  const { data: condData, isLoading: condLoading } = useHealthData<{ conditions: Condition[] }>('/health/records/conditions')
  const { data: refData, isLoading: refLoading } = useHealthData<{ referrals: Referral[] }>('/health/records/referrals')

  const encounters = encData?.encounters ?? []
  const conditions = condData?.conditions ?? []
  const referrals  = refData?.referrals ?? []

  // Build unified timeline
  const timeline = [
    ...encounters.map(e => ({ type: 'encounter' as const, id: e.id, title: e.visit_type ?? 'Visit', subtitle: e.chief_complaint, date: e.encounter_date, provider: e.provider_name })),
    ...conditions.map(c => ({ type: 'condition' as const, id: c.id, title: c.name, subtitle: `Status: ${c.status}`, date: c.onset_date ?? '', provider: c.provider_name })),
    ...referrals.map(r => ({ type: 'referral' as const, id: r.id, title: r.specialty ?? 'Referral', subtitle: r.reason, date: r.referred_at, provider: r.provider_name })),
  ].filter(e => e.date).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const isLoading = encLoading || condLoading || refLoading

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Health Records</h1>
          <p className="text-[13px] text-[var(--bb-ink-soft)]">Your complete medical history</p>
        </div>
        <div className="flex gap-2">
          <Link href="/patient/records/access"
            className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border border-[var(--bb-border)] text-[12px] font-medium text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors">
            <Lock size={12} /> Access
          </Link>
          <button className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border border-[var(--bb-border)] text-[12px] font-medium text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors">
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="encounters">Encounters</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          {isLoading
            ? <div className="space-y-3">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>
            : timeline.length > 0
              ? <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
                  {timeline.map((e, i) => (
                    <TimelineEvent key={`${e.type}-${e.id}`} type={e.type} title={e.title} subtitle={e.subtitle} date={e.date} provider={e.provider} isLast={i === timeline.length - 1} />
                  ))}
                </div>
              : <EmptyHealthState icon={FileText} title="No records yet" message="Your health timeline will build as you use Blue Boney Health." />
          }
        </TabsContent>

        <TabsContent value="conditions">
          {condLoading
            ? <div className="space-y-3">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
            : conditions.length > 0
              ? <div className="space-y-3">
                  {conditions.map(c => (
                    <div key={c.id} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{c.name}</p>
                          {c.onset_date && <p className="text-[12px] text-[var(--bb-ink-muted)] mt-0.5">Since {formatDate(c.onset_date)}</p>}
                          {c.provider_name && <p className="text-[12px] text-[var(--bb-ink-muted)]">Diagnosed by {c.provider_name}</p>}
                        </div>
                        <span className={`chip ${c.status === 'active' ? 'chip-danger' : 'chip-neutral'}`}>{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              : <EmptyHealthState icon={FileText} title="No conditions on record" message="Diagnosed conditions will appear here." />
          }
        </TabsContent>

        <TabsContent value="encounters">
          {encLoading
            ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            : encounters.length > 0
              ? <div className="space-y-3">
                  {encounters.map(e => (
                    <div key={e.id} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{e.visit_type ?? 'Visit'}</p>
                          {e.chief_complaint && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">{e.chief_complaint}</p>}
                          {e.provider_name && <p className="text-[12px] text-[var(--bb-ink-muted)]">{e.provider_name}</p>}
                        </div>
                        <time className="text-[12px] text-[var(--bb-ink-muted)] shrink-0">{formatDate(e.encounter_date)}</time>
                      </div>
                    </div>
                  ))}
                </div>
              : <EmptyHealthState icon={FileText} title="No encounters on record" message="Visit records will appear here after your appointments." />
          }
        </TabsContent>

        <TabsContent value="referrals">
          {refLoading
            ? <div className="space-y-3">{[1].map(i => <CardSkeleton key={i} />)}</div>
            : referrals.length > 0
              ? <div className="space-y-3">
                  {referrals.map(r => (
                    <div key={r.id} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{r.specialty ?? 'Referral'}</p>
                          {r.reason && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">{r.reason}</p>}
                          {r.provider_name && <p className="text-[12px] text-[var(--bb-ink-muted)]">Referred by {r.provider_name}</p>}
                        </div>
                        <time className="text-[12px] text-[var(--bb-ink-muted)] shrink-0">{formatDate(r.referred_at)}</time>
                      </div>
                    </div>
                  ))}
                </div>
              : <EmptyHealthState icon={FileText} title="No referrals" message="Specialist referrals from your providers will appear here." />
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}
