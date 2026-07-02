'use client'
import { useState } from 'react'
import { Bell, Pill, Plus, X } from 'lucide-react'
import { MedicationCard } from '@/components/health/MedicationCard'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { useRouter } from 'next/navigation'
import { patientApi } from '@/lib/api'

interface Rx {
  id: string; medication_name: string; dosage?: string; frequency?: string;
  refills_remaining?: number; status: string; start_date?: string; end_date?: string;
  prescribing_provider?: string; instructions?: string;
}

function ReminderDialog({ rx, onClose }: { rx: Rx; onClose: () => void }) {
  const [times, setTimes]     = useState<string[]>(['08:00'])
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  function addTime() { if (times.length < 4) setTimes(t => [...t, '12:00']) }
  function removeTime(i: number) { setTimes(t => t.filter((_, idx) => idx !== i)) }
  function setTime(i: number, v: string) { setTimes(t => t.map((x, idx) => idx === i ? v : x)) }

  async function save() {
    setSaving(true)
    setError('')
    try {
      await patientApi.setReminder({
        prescription_id: rx.id,
        medication_name: rx.medication_name,
        reminder_times:  times,
      })
      setSuccess(true)
      setTimeout(onClose, 1400)
    } catch {
      setError('Failed to save reminder. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white w-full max-w-sm rounded-[16px] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--bb-border)]">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[var(--h-teal)]" />
            <span className="text-[14px] font-semibold text-[var(--bb-ink)]">Set Reminder</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-[var(--bb-bg2)] flex items-center justify-center">
            <X size={14} className="text-[var(--bb-ink-soft)]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-[12px] text-[var(--bb-ink-soft)] mb-0.5">Medication</p>
            <p className="text-[14px] font-medium text-[var(--bb-ink)]">{rx.medication_name}</p>
            {rx.dosage && <p className="text-[12px] text-[var(--bb-ink-muted)]">{rx.dosage}</p>}
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-medium text-[var(--bb-ink-soft)]">Reminder times (daily)</p>
            {times.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="time" value={t} onChange={e => setTime(i, e.target.value)}
                  className="flex-1 h-9 rounded-[8px] border border-[var(--bb-border)] px-3 text-[13px] text-[var(--bb-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--h-teal)]" />
                {times.length > 1 && (
                  <button onClick={() => removeTime(i)} className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center">
                    <X size={12} className="text-[var(--h-danger)]" />
                  </button>
                )}
              </div>
            ))}
            {times.length < 4 && (
              <button onClick={addTime} className="flex items-center gap-1 text-[12px] text-[var(--h-teal)] font-medium hover:opacity-80">
                <Plus size={13} /> Add another time
              </button>
            )}
          </div>

          {error && <p className="text-[12px] text-[var(--h-danger)]">{error}</p>}
          {success && <p className="text-[12px] text-[var(--h-teal)] font-medium">Reminder set!</p>}
        </div>

        <div className="px-5 pb-5">
          <button onClick={save} disabled={saving || success}
            className="w-full h-10 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? 'Saving…' : success ? 'Saved!' : 'Save Reminder'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MedicationsPage() {
  const router = useRouter()
  const [tab, setTab]         = useState<'current' | 'past'>('current')
  const [reminderRx, setReminderRx] = useState<Rx | null>(null)

  const { data: activeData, isLoading: loadingActive } = useHealthData<{ prescriptions: Rx[] }>('/health/prescriptions', { status: 'active', limit: 50 })
  const { data: pastData,   isLoading: loadingPast   } = useHealthData<{ prescriptions: Rx[] }>('/health/prescriptions', { status: 'expired', limit: 50 })

  const active = activeData?.prescriptions ?? []
  const past   = pastData?.prescriptions  ?? []

  const activeRx = active.find(rx => rx.id === reminderRx?.id)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Medications</h1>
        <p className="text-[13px] text-[var(--bb-ink-soft)]">Your prescriptions and refill status</p>
      </div>

      <Tabs value={tab} onValueChange={v => setTab(v as 'current' | 'past')}>
        <TabsList>
          <TabsTrigger value="current">Current ({active.length})</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          {loadingActive
            ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            : active.length > 0
              ? <div className="space-y-3">{active.map(rx => (
                  <MedicationCard key={rx.id} prescription={rx}
                    onRefill={id => router.push(`/patient/medications/refill/${id}`)}
                    onReminder={id => setReminderRx(active.find(r => r.id === id) ?? null)}
                  />
                ))}</div>
              : <EmptyHealthState icon={Pill} title="No active medications" message="Your active prescriptions will appear here." />
          }
        </TabsContent>
        <TabsContent value="past">
          {loadingPast
            ? <div className="space-y-3">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
            : past.length > 0
              ? <div className="space-y-3">{past.map(rx => <MedicationCard key={rx.id} prescription={rx} />)}</div>
              : <EmptyHealthState icon={Pill} title="No past medications" message="Expired or discontinued prescriptions will appear here." />
          }
        </TabsContent>
      </Tabs>

      {reminderRx && <ReminderDialog rx={reminderRx} onClose={() => setReminderRx(null)} />}
    </div>
  )
}
