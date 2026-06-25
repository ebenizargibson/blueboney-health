'use client'
import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { patientApi } from '@/lib/api'

const MOODS = ['great', 'good', 'okay', 'low', 'bad'] as const
const MOOD_LABELS: Record<string, string> = { great: 'Great', good: 'Good', okay: 'Okay', low: 'Low', bad: 'Poor' }

export default function LogWellnessPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    weight_kg: '', systolic_bp: '', diastolic_bp: '', heart_rate: '',
    blood_glucose: '', sleep_hours: '', steps: '', water_ml: '',
    mood: '', energy_level: '', stress_level: '', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload: Record<string, unknown> = {}
      if (form.weight_kg)    payload.weight_kg    = parseFloat(form.weight_kg)
      if (form.systolic_bp)  payload.systolic_bp  = parseInt(form.systolic_bp)
      if (form.diastolic_bp) payload.diastolic_bp = parseInt(form.diastolic_bp)
      if (form.heart_rate)   payload.heart_rate   = parseInt(form.heart_rate)
      if (form.sleep_hours)  payload.sleep_hours  = parseFloat(form.sleep_hours)
      if (form.steps)        payload.steps        = parseInt(form.steps)
      if (form.water_ml)     payload.water_ml     = parseInt(form.water_ml)
      if (form.mood)         payload.mood         = form.mood
      if (form.energy_level) payload.energy_level = parseInt(form.energy_level)
      if (form.stress_level) payload.stress_level = parseInt(form.stress_level)
      if (form.notes)        payload.notes        = form.notes
      await patientApi.logWellness(payload)
      router.push('/patient/wellness')
    } catch (e: any) {
      setError(e.message ?? 'Failed to save. Please try again.')
    }
    setSaving(false)
  }

  const field = (label: string, key: string, type = 'number', placeholder = '') => (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">{label}</label>
      <input type={type} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] transition-colors" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/patient/wellness" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Wellness
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Log Today's Health</h1>

      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {field('Weight (kg)',       'weight_kg',    'number', '70.5')}
          {field('Heart Rate (bpm)',  'heart_rate',   'number', '72')}
          {field('Systolic BP',       'systolic_bp',  'number', '120')}
          {field('Diastolic BP',      'diastolic_bp', 'number', '80')}
          {field('Blood Glucose',     'blood_glucose','number', '95')}
          {field('Sleep Hours',       'sleep_hours',  'number', '7.5')}
          {field('Steps',             'steps',        'number', '8000')}
          {field('Water (ml)',        'water_ml',     'number', '2000')}
        </div>

        {/* Mood */}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-2">Mood</label>
          <div className="flex gap-2">
            {MOODS.map(m => (
              <button key={m} onClick={() => set('mood', m)}
                className={`flex-1 h-10 rounded-[8px] border text-[12px] font-medium transition-colors ${form.mood === m ? 'bg-[var(--h-teal)] text-white border-[var(--h-teal)]' : 'border-[var(--bb-border)] text-[var(--bb-ink-soft)] hover:border-[var(--h-teal)]'}`}>
                {MOOD_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Energy + Stress */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Energy Level (1–10)</label>
            <input type="range" min="1" max="10" value={form.energy_level || 5} onChange={e => set('energy_level', e.target.value)} className="w-full accent-[var(--h-teal)]" />
            <p className="text-[12px] text-[var(--bb-ink-soft)] text-center">{form.energy_level || 5}</p>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Stress Level (1–10)</label>
            <input type="range" min="1" max="10" value={form.stress_level || 5} onChange={e => set('stress_level', e.target.value)} className="w-full accent-[var(--h-danger)]" />
            <p className="text-[12px] text-[var(--bb-ink-soft)] text-center">{form.stress_level || 5}</p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            placeholder="How are you feeling today? Any symptoms or observations..."
            className="w-full rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] p-3 text-[13px] text-[var(--bb-ink)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] transition-colors" />
        </div>

        {error && <p className="text-[13px] text-[var(--h-danger)]">{error}</p>}

        <button onClick={handleSave} disabled={saving}
          className="w-full h-11 rounded-[10px] bg-[var(--h-teal)] text-white text-[14px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
          <Save size={15} /> {saving ? 'Saving...' : 'Save Today\'s Log'}
        </button>
      </div>
    </div>
  )
}
