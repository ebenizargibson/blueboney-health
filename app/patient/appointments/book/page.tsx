'use client'
import { useState } from 'react'
import { ArrowLeft, Search, Calendar, Video, MapPin, Clock, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProviderCard } from '@/components/health/ProviderCard'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { patientApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils/formatters'
import { useToast, ToastContainer } from '@/lib/hooks/useToast'

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }


interface Provider { id: string; name: string; specialty?: string; provider_type?: string; city?: string; consultation_fee?: number; currency?: string; telehealth_available?: boolean; accepting_new_patients?: boolean; profile_photo?: string; bio?: string }
interface Slot { slot_start: string; slot_end: string }

export default function BookAppointmentPage() {
  const [step, setStep] = useState<'find' | 'slots' | 'confirm' | 'payment'>('find')
  const [search, setSearch] = useState('')
  const [telehealth, setTelehealth] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [complaint, setComplaint] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toasts, toast } = useToast()

  const { data: providerData, isLoading: loadingProviders } = useHealthData<{ providers: Provider[] }>(
    '/health/providers',
    { specialty: search || undefined, telehealth_only: telehealth ? '1' : undefined, limit: 20 },
  )
  const { data: slotData, isLoading: loadingSlots } = useHealthData<{ slots: Slot[] }>(
    selectedProvider && step === 'slots' ? `/health/providers/${selectedProvider.id}/slots` : null,
    { date: selectedDate },
  )
  const { data: walletData } = useHealthData<{ wallet?: { balance: number; currency: string } }>(
    step === 'payment' ? '/health/wallet' : null,
  )

  const providers      = providerData?.providers ?? []
  const slots          = slotData?.slots ?? []
  const walletBalance  = walletData?.wallet?.balance ?? 0
  const fee            = selectedProvider?.consultation_fee ?? 0
  const currency       = selectedProvider?.currency ?? 'LRD'
  const canAfford      = walletBalance >= fee

  const handleBook = async () => {
    if (!selectedProvider || !selectedSlot) return
    setSubmitting(true); setError('')
    try {
      await patientApi.bookAppointment({
        provider_id:      selectedProvider.id,
        appointment_type: telehealth ? 'telehealth' : 'in_person',
        scheduled_at:     selectedSlot.slot_start,
        duration_minutes: 30,
        chief_complaint:  complaint,
      }, uuid())
      toast('Appointment booked successfully!', 'success')
      router.push('/patient/appointments')
    } catch (e: any) {
      setError(e.message ?? 'Booking failed. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/patient/appointments" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Book an Appointment</h1>

      {/* Step 1: Find Care */}
      {step === 'find' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by specialty or name..."
                className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] transition-colors" />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-[var(--bb-ink)]">
              <input type="checkbox" checked={telehealth} onChange={e => setTelehealth(e.target.checked)}
                className="rounded border-[var(--bb-border)] accent-[var(--h-teal)]" />
              <Video size={13} /> Telehealth available only
            </label>
          </div>

          {loadingProviders
            ? <div className="space-y-3">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
            : providers.map(p => (
              <ProviderCard key={p.id} provider={p} onBook={id => { setSelectedProvider(providers.find(x => x.id === id) ?? null); setStep('slots') }} />
            ))
          }
        </div>
      )}

      {/* Step 2: Pick slot */}
      {step === 'slots' && selectedProvider && (
        <div className="space-y-4">
          <button onClick={() => setStep('find')} className="text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] flex items-center gap-1">
            <ArrowLeft size={12} /> Change provider
          </button>
          <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4">
            <p className="text-[14px] font-semibold text-[var(--bb-ink)] mb-1">{selectedProvider.name}</p>
            {selectedProvider.specialty && <p className="text-[12px] text-[var(--bb-ink-soft)] mb-4">{selectedProvider.specialty}</p>}
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
              className="h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] transition-colors" />
          </div>

          {loadingSlots
            ? <div className="grid grid-cols-3 gap-2">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-10 rounded-[8px]" />)}</div>
            : slots.length > 0
              ? (
                <div>
                  <p className="text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-2">Available Times</p>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot, i) => (
                      <button key={i} onClick={() => { setSelectedSlot(slot); setStep('confirm') }}
                        className="h-10 rounded-[8px] border text-[13px] font-medium transition-colors hover:border-[var(--h-teal)] hover:text-[var(--h-teal)] hover:bg-[var(--h-teal-light)]"
                        style={{ borderColor: 'var(--bb-border)', color: 'var(--bb-ink)' }}>
                        {new Date(slot.slot_start).toLocaleTimeString('en-LR', { hour: 'numeric', minute: '2-digit' })}
                      </button>
                    ))}
                  </div>
                </div>
              )
              : <div className="text-center py-8 text-[13px] text-[var(--bb-ink-soft)]">No available slots on this date. Try another date.</div>
          }
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && selectedProvider && selectedSlot && (
        <div className="space-y-4">
          <button onClick={() => setStep('slots')} className="text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] flex items-center gap-1">
            <ArrowLeft size={12} /> Change time
          </button>
          <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5 space-y-4">
            <h2 className="text-[17px] font-bold text-[var(--bb-ink)]">Confirm Appointment</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--bb-ink)]"><Calendar size={14} color="var(--h-teal)" />{new Date(selectedSlot.slot_start).toLocaleDateString('en-LR', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--bb-ink)]"><Clock size={14} color="var(--h-teal)" />{new Date(selectedSlot.slot_start).toLocaleTimeString('en-LR', { hour: 'numeric', minute: '2-digit' })} · 30 minutes</div>
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--bb-ink)]">
                {telehealth ? <Video size={14} color="var(--h-teal)" /> : <MapPin size={14} color="var(--h-teal)" />}
                {telehealth ? 'Telehealth' : 'In Person'}
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Reason for Visit</label>
              <textarea value={complaint} onChange={e => setComplaint(e.target.value)} rows={3}
                placeholder="Briefly describe your symptoms or reason for the visit..."
                className="w-full rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] p-3 text-[13px] text-[var(--bb-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] resize-none transition-colors" />
            </div>
            {error && <p className="text-[13px] text-[var(--h-danger)]">{error}</p>}
            <button
              onClick={() => fee > 0 ? setStep('payment') : handleBook()}
              disabled={submitting}
              className="w-full h-11 rounded-[10px] bg-[var(--h-teal)] text-white text-[14px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60">
              {fee > 0 ? 'Continue to Payment' : (submitting ? 'Booking…' : 'Confirm Appointment')}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Payment */}
      {step === 'payment' && selectedProvider && selectedSlot && (
        <div className="space-y-4">
          <button onClick={() => setStep('confirm')} className="text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] flex items-center gap-1">
            <ArrowLeft size={12} /> Back
          </button>
          <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5 space-y-4">
            <h2 className="text-[17px] font-bold text-[var(--bb-ink)]">Payment</h2>

            {/* Fee summary */}
            <div className="bg-[var(--bb-bg2)] rounded-[10px] p-4 space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--bb-ink-soft)]">Consultation fee</span>
                <span className="font-semibold text-[var(--bb-ink)]">{formatCurrency(fee)} {currency}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--bb-ink-soft)]">Held in escrow until visit</span>
                <span className="text-[var(--bb-ink-muted)]">Released after appointment</span>
              </div>
              <hr className="border-[var(--bb-border)]" />
              <div className="flex items-center justify-between text-[14px] font-bold">
                <span className="text-[var(--bb-ink)]">Total due now</span>
                <span className="text-[var(--h-teal)]">{formatCurrency(fee)} {currency}</span>
              </div>
            </div>

            {/* Wallet balance */}
            <div className={`flex items-center gap-3 rounded-[10px] p-3 border ${canAfford ? 'border-[var(--h-success,#22C55E)] bg-[var(--h-success-bg,#F0FDF4)]' : 'border-[var(--h-danger)] bg-[var(--h-danger-bg)]'}`}>
              <Wallet size={16} color={canAfford ? 'var(--h-success,#22C55E)' : 'var(--h-danger)'} />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[var(--bb-ink)]">Health Wallet</p>
                <p className="text-[12px] text-[var(--bb-ink-muted)]">Balance: {formatCurrency(walletBalance)} {currency}</p>
              </div>
              {!canAfford && (
                <Link href="/patient/wallet" className="text-[12px] font-semibold text-[var(--h-danger)] hover:underline">
                  Top up
                </Link>
              )}
            </div>

            {!canAfford && (
              <p className="text-[13px] text-[var(--h-danger)]">
                Insufficient balance. Please top up your Health Wallet before booking.
              </p>
            )}

            {error && <p className="text-[13px] text-[var(--h-danger)]">{error}</p>}

            <button onClick={handleBook} disabled={submitting || !canAfford}
              className="w-full h-11 rounded-[10px] bg-[var(--h-teal)] text-white text-[14px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Booking…' : `Pay ${formatCurrency(fee)} ${currency} & Book`}
            </button>
            <p className="text-[11px] text-center text-[var(--bb-ink-muted)]">
              Payment held in escrow and released to your provider after the appointment.
            </p>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
