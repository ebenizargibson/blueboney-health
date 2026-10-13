'use client'
import { useState } from 'react'
import { FileText, Download, Lock, Activity } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { ToastContainer } from '@/lib/hooks/useToast'
import { TimelineEvent } from '@/components/health/TimelineEvent'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { DataError } from '@/components/shared/DataError'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { formatDate, formatDateTime } from '@/lib/utils/formatters'
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge'
import { LabResultRow } from '@/components/health/LabResultRow'
import Link from 'next/link'
import { patientApi } from '@/lib/api'

interface Encounter    { id: string; visit_type?: string; chief_complaint?: string; encounter_date: string; provider_name?: string }
interface Condition    { id: string; name?: string; code_display?: string; status: string; onset_date?: string; provider_name?: string }
interface Referral     { id: string; specialty?: string; reason?: string; referred_at: string; provider_name?: string }
interface Observation  { id: string; observation_type?: string; observation_name?: string; value_quantity?: number; value_unit?: string; value_string?: string; interpretation?: string; observed_at: string; provider_name?: string }

export default function RecordsPage() {
  const [exporting, setExporting] = useState(false)
  const { toasts, toast } = useToast()

  const { data: encData,  error: encErr,  isLoading: encLoading,  mutate: encMutate  } = useHealthData<{ encounters: Encounter[] }>('/health/records/encounters', { limit: 20 })
  const { data: condData, error: condErr, isLoading: condLoading, mutate: condMutate } = useHealthData<{ conditions: Condition[] }>('/health/records/conditions')
  const { data: refData,  error: refErr,  isLoading: refLoading,  mutate: refMutate  } = useHealthData<{ referrals: Referral[] }>('/health/records/referrals')
  const { data: obsData,  error: obsErr,  isLoading: obsLoading,  mutate: obsMutate  } = useHealthData<{ observations: Observation[] }>('/health/records/observations', { limit: 50 })

  const encounters   = encData?.encounters  ?? []
  const conditions   = condData?.conditions ?? []
  const referrals    = refData?.referrals   ?? []
  const observations = obsData?.observations ?? []

  const timeline = [
    ...encounters.map(e  => ({ type: 'encounter' as const, id: e.id, title: e.visit_type ?? 'Visit',      subtitle: e.chief_complaint, date: e.encounter_date, provider: e.provider_name })),
    ...conditions.map(c  => ({ type: 'condition' as const, id: c.id, title: c.name ?? c.code_display ?? 'Condition', subtitle: `Status: ${c.status}`, date: c.onset_date ?? '', provider: c.provider_name })),
    ...referrals.map(r   => ({ type: 'referral'  as const, id: r.id, title: r.specialty ?? 'Referral',    subtitle: r.reason,          date: r.referred_at,    provider: r.provider_name })),
  ].filter(e => e.date).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleExport = async () => {
    setExporting(true)
    try {
      await patientApi.exportRecords({ format: 'json', include: ['encounters', 'observations', 'conditions', 'medications', 'labs'] })
      toast('Export requested. You will receive a download link via message within 24 hours.', 'success')
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Export request failed', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} />
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
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border border-[var(--bb-border)] text-[12px] font-medium text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors disabled:opacity-60">
            <Download size={12} /> {exporting ? 'Requesting…' : 'Export'}
          </button>
        </div>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="observations">Vitals & Obs</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="encounters">Encounters</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        {/* ── Timeline ── */}
        <TabsContent value="timeline">
          {encLoading || condLoading || refLoading
            ? <div className="space-y-3">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>
            : (encErr || condErr || refErr)
              ? <DataError message={(encErr ?? condErr ?? refErr)?.message} onRetry={() => { encMutate(); condMutate(); refMutate() }} />
              : timeline.length > 0
                ? <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
                    {timeline.map((e, i) => (
                      <TimelineEvent key={`${e.type}-${e.id}`} type={e.type} title={e.title} subtitle={e.subtitle} date={e.date} provider={e.provider} isLast={i === timeline.length - 1} />
                    ))}
                  </div>
                : <EmptyHealthState icon={FileText} title="No records yet" message="Your health timeline will build as you use Blue Boney Health." />
          }
        </TabsContent>

        {/* ── Observations ── */}
        <TabsContent value="observations">
          {obsLoading
            ? <div className="space-y-2">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>
            : obsErr
              ? <DataError message={obsErr.message} onRetry={obsMutate} />
              : observations.length > 0
                ? <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
                    {observations.map(o => {
                      const value = o.value_quantity !== undefined ? String(o.value_quantity) : (o.value_string ?? '—')
                      return (
                        <div key={o.id} className="px-4 py-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[var(--bb-ink)]">{o.observation_name ?? o.observation_type ?? 'Observation'}</p>
                            <p className="text-[11px] text-[var(--bb-ink-muted)] mt-0.5">
                              {formatDateTime(o.observed_at)}{o.provider_name ? ` · ${o.provider_name}` : ''}
                            </p>
                          </div>
                          <LabResultRow
                            name=""
                            value={value}
                            unit={o.value_unit}
                            interpretation={o.interpretation}
                            compact
                          />
                        </div>
                      )
                    })}
                  </div>
                : <EmptyHealthState icon={Activity} title="No observations recorded" message="Vital signs and clinical observations from your provider visits will appear here." />
          }
        </TabsContent>

        {/* ── Conditions ── */}
        <TabsContent value="conditions">
          {condLoading
            ? <div className="space-y-3">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
            : condErr
              ? <DataError message={condErr.message} onRetry={condMutate} />
              : conditions.length > 0
                ? <div className="space-y-3">
                    {conditions.map(c => (
                      <div key={c.id} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{c.name ?? c.code_display ?? 'Unknown'}</p>
                            {c.onset_date    && <p className="text-[12px] text-[var(--bb-ink-muted)] mt-0.5">Since {formatDate(c.onset_date)}</p>}
                            {c.provider_name && <p className="text-[12px] text-[var(--bb-ink-muted)]">Diagnosed by {c.provider_name}</p>}
                          </div>
                          <HealthStatusBadge status={c.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                : <EmptyHealthState icon={FileText} title="No conditions on record" message="Diagnosed conditions will appear here." />
          }
        </TabsContent>

        {/* ── Encounters ── */}
        <TabsContent value="encounters">
          {encLoading
            ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            : encErr
              ? <DataError message={encErr.message} onRetry={encMutate} />
              : encounters.length > 0
                ? <div className="space-y-3">
                    {encounters.map(e => (
                      <div key={e.id} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{e.visit_type ?? 'Visit'}</p>
                            {e.chief_complaint && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">{e.chief_complaint}</p>}
                            {e.provider_name   && <p className="text-[12px] text-[var(--bb-ink-muted)]">{e.provider_name}</p>}
                          </div>
                          <time className="text-[12px] text-[var(--bb-ink-muted)] shrink-0">{formatDate(e.encounter_date)}</time>
                        </div>
                      </div>
                    ))}
                  </div>
                : <EmptyHealthState icon={FileText} title="No encounters on record" message="Visit records will appear here after your appointments." />
          }
        </TabsContent>

        {/* ── Referrals ── */}
        <TabsContent value="referrals">
          {refLoading
            ? <div className="space-y-3">{[1].map(i => <CardSkeleton key={i} />)}</div>
            : refErr
              ? <DataError message={refErr.message} onRetry={refMutate} />
              : referrals.length > 0
                ? <div className="space-y-3">
                    {referrals.map(r => (
                      <div key={r.id} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{r.specialty ?? 'Referral'}</p>
                            {r.reason        && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">{r.reason}</p>}
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
