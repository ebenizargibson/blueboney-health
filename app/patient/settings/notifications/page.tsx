'use client'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface NotifGroup { group: string; items: { key: string; label: string; desc: string }[] }

const GROUPS: NotifGroup[] = [
  {
    group: 'Appointments',
    items: [
      { key: 'appt_reminder_24h',  label: '24-hour reminder',        desc: 'Remind me 24 hours before appointments' },
      { key: 'appt_reminder_2h',   label: '2-hour reminder',         desc: 'Remind me 2 hours before appointments' },
      { key: 'appt_cancelled',     label: 'Cancellation alerts',     desc: 'When an appointment is cancelled by provider' },
      { key: 'appt_reschedule',    label: 'Reschedule alerts',       desc: 'When an appointment is rescheduled' },
    ],
  },
  {
    group: 'Lab Results',
    items: [
      { key: 'lab_resulted',       label: 'Results available',       desc: 'When lab results are ready to view' },
      { key: 'lab_critical',       label: 'Critical value alerts',   desc: 'Immediate alert for critical lab values' },
    ],
  },
  {
    group: 'Messages',
    items: [
      { key: 'message_received',   label: 'New messages',            desc: 'When your care team sends a message' },
    ],
  },
  {
    group: 'Medications',
    items: [
      { key: 'med_reminder',       label: 'Medication reminders',    desc: 'Daily reminders based on your schedule' },
      { key: 'refill_due',         label: 'Refill reminders',        desc: 'When a prescription is due for refill' },
    ],
  },
  {
    group: 'Billing',
    items: [
      { key: 'bill_due',           label: 'Bill due reminders',      desc: 'Upcoming payment due dates' },
      { key: 'payment_confirmed',  label: 'Payment confirmations',   desc: 'When a payment is processed' },
    ],
  },
]

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(GROUPS.flatMap(g => g.items.map(i => [i.key, true])))
  )
  const [saved, setSaved] = useState(false)

  const toggle = (key: string) => setPrefs(p => ({ ...p, [key]: !p[key] }))
  const handleSave = () => {
    // Would call patientApi.updateProfile({ notification_prefs: prefs })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Link href="/patient/settings" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Settings
      </Link>
      <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Notifications</h1>

      <div className="space-y-4">
        {GROUPS.map(g => (
          <div key={g.group} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
            <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-4">{g.group}</h2>
            <div className="space-y-3">
              {g.items.map(item => (
                <div key={item.key} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-[var(--bb-ink)]">{item.label}</p>
                    <p className="text-[11px] text-[var(--bb-ink-muted)]">{item.desc}</p>
                  </div>
                  <button onClick={() => toggle(item.key)} role="switch" aria-checked={prefs[item.key]}
                    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${prefs[item.key] ? 'bg-[var(--h-teal)]' : 'bg-[var(--bb-border)]'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[item.key] ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {saved && <p className="text-[12px] text-[var(--h-success)]">Preferences saved.</p>}
      <button onClick={handleSave}
        className="h-10 px-5 rounded-[9px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors">
        Save Preferences
      </button>
    </div>
  )
}
