'use client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { patientApi } from '@/lib/api'
import { randomUUID } from '@/lib/utils/uuid'
import { RELATIONSHIPS } from '@/lib/utils/health'

export default function AddFamilyMemberPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name: '', last_name: '', relationship: 'child',
    date_of_birth: '', blood_type: '', phone: '',
    can_view: true, can_book: false, can_pay: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name) {
      setError('First and last name are required'); return
    }
    setSubmitting(true); setError('')
    try {
      await patientApi.addMember(form, randomUUID())
      router.push('/patient/family?added=1')
    } catch (e: any) {
      setError(e.message ?? 'Failed to add family member')
    }
    setSubmitting(false)
  }

  const textField = (label: string, key: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">{label}</label>
      <input type={type} value={String(form[key as keyof typeof form])} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
    </div>
  )

  const toggle = (label: string, key: string, desc: string) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[13px] font-medium text-[var(--bb-ink)]">{label}</p>
        <p className="text-[11px] text-[var(--bb-ink-muted)]">{desc}</p>
      </div>
      <button onClick={() => set(key, !form[key as keyof typeof form])} role="switch"
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${form[key as keyof typeof form] ? 'bg-[var(--h-teal)]' : 'bg-[var(--bb-border)]'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[key as keyof typeof form] ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
    </div>
  )

  return (
    <div className="space-y-5 max-w-lg">
      <Link href="/patient/family" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Family
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Add Family Member</h1>

      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {textField('First Name', 'first_name')}
          {textField('Last Name',  'last_name')}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Relationship</label>
          <select value={form.relationship} onChange={e => set('relationship', e.target.value)}
            className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]">
            {RELATIONSHIPS.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>

        {textField('Date of Birth', 'date_of_birth', 'date')}
        {textField('Blood Type',    'blood_type',    'text', 'e.g. O+')}
        {textField('Phone Number',  'phone',         'tel',  '+231...')}

        <div className="border-t border-[var(--bb-border)] pt-4">
          <p className="text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-3">Permissions</p>
          <div className="space-y-3">
            {toggle('View Records',    'can_view', 'Allow this member to view their own health records through your account')}
            {toggle('Book Appointments','can_book', 'Allow booking healthcare appointments for this member')}
            {toggle('Pay Bills',       'can_pay',  'Allow paying medical bills on behalf of this member')}
          </div>
        </div>

        {error && <p className="text-[13px] text-[var(--h-danger)]">{error}</p>}

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full h-11 rounded-[10px] bg-[var(--h-teal)] text-white text-[14px] font-bold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60">
          {submitting ? 'Adding...' : 'Add Family Member'}
        </button>
      </div>
    </div>
  )
}
