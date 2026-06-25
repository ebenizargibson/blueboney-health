'use client'
import { use, useState } from 'react'
import { ArrowLeft, Pill, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { patientApi } from '@/lib/api'
import { randomUUID } from '@/lib/utils/uuid'

interface Prescription { id: string; medication_name: string; dosage?: string; frequency?: string; refills_remaining?: number; prescribing_doctor?: string; pharmacy_name?: string }

export default function MedicationRefillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data } = useHealthData<{ prescription: Prescription }>(`/health/prescriptions/${id}`)
  const rx = data?.prescription

  const [notes, setNotes]           = useState('')
  const [deliveryPref, setDelivery] = useState<'pickup' | 'delivery'>('pickup')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async () => {
    setSubmitting(true); setError('')
    try {
      await patientApi.requestRefill(id, { notes, delivery_preference: deliveryPref }, randomUUID())
      router.push('/patient/medications?refill=requested')
    } catch (e: any) {
      setError(e.message ?? 'Failed to submit refill request')
    }
    setSubmitting(false)
  }

  if (!rx) {
    return <div className="text-[var(--bb-ink-soft)] mt-20 text-center">Loading prescription...</div>
  }

  return (
    <div className="space-y-5 max-w-md">
      <Link href="/patient/medications" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Medications
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Request Refill</h1>

      {/* Rx info */}
      <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[var(--h-teal-light)] flex items-center justify-center">
            <Pill size={16} color="var(--h-teal)" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-[var(--bb-ink)]">{rx.medication_name}</p>
            {rx.dosage    && <p className="text-[12px] text-[var(--bb-ink-muted)]">{rx.dosage}</p>}
            {rx.frequency && <p className="text-[12px] text-[var(--bb-ink-muted)]">{rx.frequency}</p>}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--bb-border)] flex items-center justify-between text-[12px]">
          <span className="text-[var(--bb-ink-muted)]">Refills remaining</span>
          <span className={`font-bold ${(rx.refills_remaining ?? 0) > 0 ? 'text-[var(--h-success)]' : 'text-[var(--h-danger)]'}`}>
            {rx.refills_remaining ?? 0}
          </span>
        </div>
      </div>

      {(rx.refills_remaining ?? 0) <= 0 && (
        <div className="alert alert-warning text-[12px]">
          No refills remaining. Your doctor will need to authorize a new prescription.
        </div>
      )}

      {/* Delivery preference */}
      <div className="space-y-2">
        <p className="text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide">Preference</p>
        {(['pickup', 'delivery'] as const).map(opt => (
          <button key={opt} onClick={() => setDelivery(opt)}
            className={`w-full flex items-center gap-3 p-4 rounded-[10px] border transition-colors text-left ${deliveryPref === opt ? 'border-[var(--h-teal)] bg-[var(--h-teal-light)]' : 'border-[var(--bb-border)] bg-white hover:border-[var(--h-teal)]'}`}>
            <MapPin size={16} color={deliveryPref === opt ? 'var(--h-teal)' : 'var(--bb-ink-muted)'} />
            <div>
              <p className="text-[13px] font-semibold text-[var(--bb-ink)] capitalize">{opt}</p>
              <p className="text-[11px] text-[var(--bb-ink-muted)]">
                {opt === 'pickup' ? `Pick up from ${rx.pharmacy_name ?? 'your pharmacy'}` : 'Have it delivered to your address'}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Any special instructions or notes for your pharmacist..."
          className="w-full rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] p-3 text-[13px] text-[var(--bb-ink)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
      </div>

      {error && <p className="text-[13px] text-[var(--h-danger)]">{error}</p>}

      <button onClick={handleSubmit} disabled={submitting || (rx.refills_remaining ?? 0) <= 0}
        className="w-full h-12 rounded-[10px] bg-[var(--h-teal)] text-white text-[14px] font-bold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60">
        {submitting ? 'Submitting...' : 'Submit Refill Request'}
      </button>
    </div>
  )
}
