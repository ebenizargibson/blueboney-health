'use client'
import { useState } from 'react'
import { User, Shield, Bell, Lock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePatientSession } from '@/lib/hooks/usePatientSession'
import { patientApi } from '@/lib/api'

const SETTING_LINKS = [
  { href: '/patient/settings/security',      icon: Shield, label: 'Security',      desc: 'Password, sessions, MFA' },
  { href: '/patient/settings/notifications', icon: Bell,   label: 'Notifications', desc: 'Appointment, lab, message alerts' },
  { href: '/patient/settings/privacy',       icon: Lock,   label: 'Privacy',       desc: 'Data export, consent, access logs' },
]

export default function SettingsPage() {
  const { session } = usePatientSession()
  const [form, setForm]     = useState({ full_name: session?.fullName ?? '', phone: session?.kind === 'banking' ? session.phone : '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false)
    try {
      await patientApi.updateProfile(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message ?? 'Failed to save')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Settings</h1>

      {/* Profile section */}
      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-full bg-[var(--h-teal-light)] flex items-center justify-center">
            <span className="text-[20px] font-bold text-[var(--h-teal)]">
              {(session?.fullName ?? 'U').charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-[16px] font-bold text-[var(--bb-ink)]">{session?.fullName}</p>
            <p className="text-[12px] text-[var(--bb-ink-muted)]">{session?.kind === 'banking' ? `KYC: ${session.kycStatus} · Tier ${session.tier}` : 'Signed in with your health record'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Full Name</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">Phone Number</label>
            <input value={form.phone} readOnly
              className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg2)] text-[13px] text-[var(--bb-ink-muted)] cursor-not-allowed" />
            <p className="text-[11px] text-[var(--bb-ink-muted)] mt-1">Phone number cannot be changed here. Contact support.</p>
          </div>

          {error && <p className="text-[12px] text-[var(--h-danger)]">{error}</p>}
          {saved && <p className="text-[12px] text-[var(--h-success)]">Profile updated successfully.</p>}

          <button onClick={handleSave} disabled={saving}
            className="h-10 px-5 rounded-[9px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Setting links */}
      <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
        {SETTING_LINKS.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}
            className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bb-bg)] transition-colors">
            <div className="w-9 h-9 rounded-[8px] bg-[var(--h-teal-light)] flex items-center justify-center shrink-0">
              <Icon size={16} color="var(--h-teal)" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{label}</p>
              <p className="text-[12px] text-[var(--bb-ink-muted)]">{desc}</p>
            </div>
            <ChevronRight size={14} color="var(--bb-ink-muted)" />
          </Link>
        ))}
      </div>
    </div>
  )
}
