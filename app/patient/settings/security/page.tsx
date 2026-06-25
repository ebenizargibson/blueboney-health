'use client'
import { useState } from 'react'
import { ArrowLeft, Key, Monitor, LogOut } from 'lucide-react'
import Link from 'next/link'
import { patientApi } from '@/lib/api'
import { portalAuth } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function SecuritySettingsPage() {
  const router = useRouter()
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  const handleChangePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_password) {
      setError('New passwords do not match'); return
    }
    if (pwForm.new_password.length < 8) {
      setError('Password must be at least 8 characters'); return
    }
    setSaving(true); setError(''); setSuccess('')
    try {
      await patientApi.updateProfile({ password_update: { current: pwForm.current_password, new: pwForm.new_password } })
      setSuccess('Password updated successfully.')
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (e: any) {
      setError(e.message ?? 'Failed to update password')
    }
    setSaving(false)
  }

  const handleSignOutAll = async () => {
    await portalAuth.logout()
    router.push('/login')
  }

  const field = (label: string, key: keyof typeof pwForm, placeholder?: string) => (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] uppercase tracking-wide mb-1.5">{label}</label>
      <input type="password" value={pwForm[key]} placeholder={placeholder}
        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full h-10 px-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]" />
    </div>
  )

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/patient/settings" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Settings
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Security</h1>

      {/* Change password */}
      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Key size={16} color="var(--h-teal)" />
          <h2 className="text-[15px] font-bold text-[var(--bb-ink)]">Change Password</h2>
        </div>
        <div className="space-y-4">
          {field('Current Password',  'current_password', '••••••••')}
          {field('New Password',      'new_password',     'Min 8 characters')}
          {field('Confirm New Password', 'confirm_password', 'Re-enter new password')}
          {error   && <p className="text-[12px] text-[var(--h-danger)]">{error}</p>}
          {success && <p className="text-[12px] text-[var(--h-success)]">{success}</p>}
          <button onClick={handleChangePassword} disabled={saving}
            className="h-10 px-5 rounded-[9px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Monitor size={16} color="var(--h-teal)" />
          <h2 className="text-[15px] font-bold text-[var(--bb-ink)]">Active Sessions</h2>
        </div>
        <p className="text-[13px] text-[var(--bb-ink-soft)] mb-4">
          You are currently signed in on this device. To revoke all sessions and sign out everywhere:
        </p>
        <button onClick={handleSignOutAll}
          className="flex items-center gap-2 h-10 px-4 rounded-[9px] border border-[var(--h-danger)] text-[var(--h-danger)] text-[13px] font-semibold hover:bg-[var(--h-danger-bg)] transition-colors">
          <LogOut size={14} /> Sign Out All Devices
        </button>
      </div>
    </div>
  )
}
