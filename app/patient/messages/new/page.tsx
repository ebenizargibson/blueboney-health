'use client'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { patientApi } from '@/lib/api'
import { randomUUID } from '@/lib/utils/uuid'

interface Provider { id: string; first_name: string; last_name: string; specialization?: string }

const THREAD_TYPES = [
  { value: 'general',               label: 'General Question' },
  { value: 'prescription_request',  label: 'Prescription Request' },
  { value: 'appointment_question',  label: 'Appointment Question' },
  { value: 'lab_result_question',   label: 'Lab Result Question' },
  { value: 'referral',              label: 'Referral Request' },
]

export default function NewMessagePage() {
  const router = useRouter()
  const { data } = useHealthData<{ providers: Provider[] }>('/health/providers')
  const providers = data?.providers ?? []

  const [form, setForm] = useState({ provider_id: '', subject: '', message: '', thread_type: 'general' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSend = async () => {
    if (!form.provider_id || !form.subject || !form.message) {
      setError('Please fill in all fields'); return
    }
    setSubmitting(true); setError('')
    try {
      const res = await patientApi.createThread({ ...form }, randomUUID()) as { thread_id?: string; id?: string }
      const threadId = res?.thread_id ?? res?.id
      router.push(threadId ? `/patient/messages/${threadId}` : '/patient/messages')
    } catch (e: any) {
      setError(e.message ?? 'Failed to send message')
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-5 max-w-lg">
      <Link href="/patient/messages" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Messages
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">New Message</h1>

      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] p-6 space-y-4">
        {/* Provider */}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">To (Provider)</label>
          <select value={form.provider_id} onChange={e => set('provider_id', e.target.value)}
            className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]">
            <option value="">Select a provider...</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>
                Dr. {p.first_name} {p.last_name}{p.specialization ? ` — ${p.specialization}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Message Type</label>
          <select value={form.thread_type} onChange={e => set('thread_type', e.target.value)}
            className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]">
            {THREAD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Subject</label>
          <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Brief description of your question..."
            className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
        </div>

        {/* Message */}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Message</label>
          <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={6}
            placeholder="Describe your question or concern in detail..."
            className="w-full rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] p-3 text-[13px] text-[var(--bb-ink)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
        </div>

        <div className="bg-[var(--h-warning-bg)] border border-[var(--h-warning)] rounded-[8px] p-3 text-[11px] text-[var(--bb-ink-soft)]">
          For medical emergencies, call emergency services immediately. This messaging system is not for urgent care.
        </div>

        {error && <p className="text-[13px] text-[var(--h-danger)]">{error}</p>}

        <button onClick={handleSend} disabled={submitting}
          className="w-full h-11 rounded-[10px] bg-[var(--h-teal)] text-white text-[14px] font-bold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          <Send size={15} /> {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  )
}
