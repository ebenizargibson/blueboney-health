'use client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { patientApi } from '@/lib/api'
import { randomUUID } from '@/lib/utils/uuid'

export default function AddInsurancePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    insurance_company: '', policy_number: '', group_number: '',
    plan_name: '', plan_type: 'hmo', effective_date: '', expiry_date: '',
    member_id: '', relationship_to_insured: 'self',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.insurance_company || !form.policy_number) {
      setError('Insurance company and policy number are required')
      return
    }
    setSubmitting(true); setError('')
    try {
      await patientApi.addPolicy(form, randomUUID())
      router.push('/patient/insurance?added=1')
    } catch (e: any) {
      setError(e.message ?? 'Failed to add insurance policy')
    }
    setSubmitting(false)
  }

  const field = (label: string, key: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">{label}</label>
      <input type={type} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
    </div>
  )

  const select = (label: string, key: string, options: { value: string; label: string }[]) => (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">{label}</label>
      <select value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)}
        className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  return (
    <div className="space-y-5 max-w-lg">
      <Link href="/patient/insurance" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Insurance
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Add Insurance Policy</h1>

      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] p-6 space-y-4">
        {field('Insurance Company', 'insurance_company', 'text', 'e.g. National Health Insurance')}
        {field('Policy Number',     'policy_number',     'text', 'e.g. POL-123456')}
        {field('Group Number',      'group_number',      'text', 'e.g. GRP-78900')}
        {field('Plan Name',         'plan_name',         'text', 'e.g. Gold Plan')}
        {field('Member ID',         'member_id',         'text', 'Member/Subscriber ID')}
        {select('Plan Type', 'plan_type', [
          { value: 'hmo',  label: 'HMO' },
          { value: 'ppo',  label: 'PPO' },
          { value: 'epo',  label: 'EPO' },
          { value: 'pos',  label: 'POS' },
          { value: 'other',label: 'Other' },
        ])}
        {select('Your Relationship to Insured', 'relationship_to_insured', [
          { value: 'self',   label: 'Self' },
          { value: 'spouse', label: 'Spouse' },
          { value: 'child',  label: 'Child' },
          { value: 'other',  label: 'Other' },
        ])}
        <div className="grid grid-cols-2 gap-4">
          {field('Effective Date', 'effective_date', 'date')}
          {field('Expiry Date',    'expiry_date',    'date')}
        </div>

        {error && <p className="text-[13px] text-[var(--h-danger)]">{error}</p>}

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full h-11 rounded-[10px] bg-[var(--h-teal)] text-white text-[14px] font-bold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60">
          {submitting ? 'Adding...' : 'Add Insurance Policy'}
        </button>
      </div>
    </div>
  )
}
