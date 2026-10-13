'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, CheckCircle, ArrowRight } from 'lucide-react'
import { patientApi } from '@/lib/api'
import { refusalIn, reportAccessRefused } from '@/lib/accessRefused'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function ActivatePage() {
  const router = useRouter()
  const [step, setStep]       = useState<'intro' | 'profile' | 'consent'>('intro')
  const [bloodType, setBloodType] = useState('')
  const [allergies, setAllergies] = useState('')
  const [conditions, setConditions] = useState('')
  const [medications, setMedications] = useState('')
  const [ecName, setEcName]   = useState('')
  const [ecPhone, setEcPhone] = useState('')
  const [ecRel, setEcRel]     = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const splitList = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean)

  const handleActivate = async () => {
    if (!consent) return
    setLoading(true); setError('')
    try {
      await patientApi.status() // warm the proxy
      const res = await fetch('/api/proxy/health/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_confirmed: true,
          ...(bloodType    ? { blood_type: bloodType }                     : {}),
          ...(allergies    ? { allergies: splitList(allergies) }           : {}),
          ...(conditions   ? { chronic_conditions: splitList(conditions) } : {}),
          ...(medications  ? { current_medications: splitList(medications) } : {}),
          ...(ecName       ? { emergency_contact_name: ecName }            : {}),
          ...(ecPhone      ? { emergency_contact_phone: ecPhone }          : {}),
          ...(ecRel        ? { emergency_contact_relation: ecRel }         : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const refusal = refusalIn(res.status, data)
        if (refusal) { reportAccessRefused(refusal); setLoading(false); return }
        setError(data.message ?? 'Activation failed. Please try again.'); setLoading(false); return
      }
      router.push('/patient')
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bb-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] space-y-4">

        {/* Header */}
        <div className="text-center mb-2">
          <div className="w-14 h-14 rounded-[14px] bg-[var(--h-teal)] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(8,145,178,0.3)]">
            <Heart size={26} color="white" fill="white" />
          </div>
          <h1 className="text-[24px] font-extrabold text-[var(--bb-ink)]">Activate Your Health Profile</h1>
          <p className="text-[14px] text-[var(--bb-ink-soft)] mt-1">Get access to appointments, records, and your care team.</p>
        </div>

        {/* Step: Intro */}
        {step === 'intro' && (
          <div className="bg-white rounded-[16px] border border-[var(--bb-border)] p-6 space-y-4">
            <div className="space-y-3">
              {[
                { icon: '📅', title: 'Book Appointments', desc: 'Schedule in-person or telehealth visits' },
                { icon: '💊', title: 'Manage Prescriptions', desc: 'View and request medication refills' },
                { icon: '🧪', title: 'Access Lab Results', desc: 'Receive results directly from your care team' },
                { icon: '💬', title: 'Message Your Providers', desc: 'Secure HIPAA-compliant clinical messaging' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="text-[20px] leading-none mt-0.5">{f.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{f.title}</p>
                    <p className="text-[12px] text-[var(--bb-ink-muted)]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep('profile')}
              className="w-full h-11 rounded-[10px] bg-[var(--h-teal)] text-white text-[14px] font-bold hover:bg-[var(--h-teal-hover)] transition-colors flex items-center justify-center gap-2">
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step: Profile */}
        {step === 'profile' && (
          <div className="bg-white rounded-[16px] border border-[var(--bb-border)] p-6 space-y-4">
            <p className="text-[13px] text-[var(--bb-ink-soft)]">All fields optional — you can update these later in Settings.</p>

            <div>
              <label className="label-sm">Blood Type</label>
              <select value={bloodType} onChange={e => setBloodType(e.target.value)}
                className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] text-[var(--bb-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]">
                <option value="">Unknown / Prefer not to say</option>
                {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="label-sm">Known Allergies <span className="font-normal text-[var(--bb-ink-muted)]">(comma-separated)</span></label>
              <input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. Penicillin, Peanuts"
                className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
            </div>

            <div>
              <label className="label-sm">Chronic Conditions <span className="font-normal text-[var(--bb-ink-muted)]">(comma-separated)</span></label>
              <input value={conditions} onChange={e => setConditions(e.target.value)} placeholder="e.g. Hypertension, Diabetes"
                className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
            </div>

            <div>
              <label className="label-sm">Current Medications <span className="font-normal text-[var(--bb-ink-muted)]">(comma-separated)</span></label>
              <input value={medications} onChange={e => setMedications(e.target.value)} placeholder="e.g. Metformin 500mg, Lisinopril"
                className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
            </div>

            <hr className="border-[var(--bb-border)]" />
            <p className="text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide">Emergency Contact</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-sm">Name</label>
                <input value={ecName} onChange={e => setEcName(e.target.value)} placeholder="Full name"
                  className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
              </div>
              <div>
                <label className="label-sm">Relationship</label>
                <input value={ecRel} onChange={e => setEcRel(e.target.value)} placeholder="e.g. Spouse"
                  className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
              </div>
            </div>
            <div>
              <label className="label-sm">Phone</label>
              <input value={ecPhone} onChange={e => setEcPhone(e.target.value)} placeholder="+231 77 000 0000"
                className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('intro')}
                className="flex-1 h-10 rounded-[8px] border border-[var(--bb-border)] text-[13px] font-medium text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors">
                Back
              </button>
              <button onClick={() => setStep('consent')}
                className="flex-1 h-10 rounded-[8px] bg-[var(--h-teal)] text-white text-[13px] font-bold hover:bg-[var(--h-teal-hover)] transition-colors">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Consent */}
        {step === 'consent' && (
          <div className="bg-white rounded-[16px] border border-[var(--bb-border)] p-6 space-y-4">
            <h2 className="text-[17px] font-bold text-[var(--bb-ink)]">Review & Consent</h2>
            <p className="text-[13px] text-[var(--bb-ink-soft)] leading-relaxed">
              Blue Boney Health will store and process your health information to provide clinical services.
              Your data is encrypted at rest, never sold, and shared only with providers you authorise.
              You may request deletion at any time in Settings.
            </p>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`mt-0.5 w-5 h-5 rounded-[5px] flex items-center justify-center border-2 shrink-0 transition-colors ${consent ? 'bg-[var(--h-teal)] border-[var(--h-teal)]' : 'border-[var(--bb-border)] group-hover:border-[var(--h-teal)]'}`}
                onClick={() => setConsent(c => !c)}>
                {consent && <CheckCircle size={14} color="white" />}
              </div>
              <span className="text-[13px] text-[var(--bb-ink)] leading-snug">
                I consent to the collection and processing of my health data as described above.
              </span>
            </label>

            {error && (
              <div className="bg-[var(--h-danger-bg)] border border-[var(--h-danger)] rounded-[8px] px-3 py-2.5">
                <p className="text-[13px] text-[var(--h-danger)]">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('profile')}
                className="flex-1 h-10 rounded-[8px] border border-[var(--bb-border)] text-[13px] font-medium text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors">
                Back
              </button>
              <button onClick={handleActivate} disabled={!consent || loading}
                className="flex-1 h-10 rounded-[8px] bg-[var(--h-teal)] text-white text-[13px] font-bold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Activating…' : 'Activate Health Profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
