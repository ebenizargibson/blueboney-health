'use client'
import { use, useState } from 'react'
import { ArrowLeft, Calendar, Eye, CreditCard, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { patientApi } from '@/lib/api'
import { formatDate } from '@/lib/utils/formatters'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'

interface FamilyMember { id: string; first_name: string; last_name: string; relationship: string; date_of_birth?: string; blood_type?: string; phone?: string; can_view: boolean; can_book: boolean; can_pay: boolean }

export default function FamilyMemberPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = use(params)
  const router = useRouter()
  const { data, isLoading, mutate } = useHealthData<{ member: FamilyMember }>(`/health/family/${memberId}`)
  const member = data?.member
  const [saving, setSaving] = useState(false)
  const [perms, setPerms]   = useState<{ can_view: boolean; can_book: boolean; can_pay: boolean } | null>(null)
  const effective = perms ?? { can_view: member?.can_view ?? false, can_book: member?.can_book ?? false, can_pay: member?.can_pay ?? false }

  const togglePerm = (k: keyof typeof effective) => setPerms({ ...effective, [k]: !effective[k] })

  const handleSave = async () => {
    setSaving(true)
    try {
      await patientApi.setPermissions(memberId, effective)
      mutate()
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <div className="space-y-4 max-w-lg">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
  if (!member)   return <div className="text-[var(--bb-ink-soft)]">Member not found.</div>

  return (
    <div className="space-y-5 max-w-lg">
      <Link href="/patient/family" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Family
      </Link>

      {/* Member card */}
      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-[var(--h-teal-light)] flex items-center justify-center">
            <span className="text-[22px] font-bold text-[var(--h-teal)]">
              {member.first_name[0]}{member.last_name[0]}
            </span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-[var(--bb-ink)]">{member.first_name} {member.last_name}</p>
            <p className="text-[13px] text-[var(--bb-ink-soft)] capitalize">{member.relationship}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[13px]">
          {member.date_of_birth && (
            <div>
              <p className="text-[10px] font-semibold text-[var(--bb-ink-muted)] uppercase mb-0.5">Date of Birth</p>
              <p className="text-[var(--bb-ink)]">{formatDate(member.date_of_birth)}</p>
            </div>
          )}
          {member.blood_type && (
            <div>
              <p className="text-[10px] font-semibold text-[var(--bb-ink-muted)] uppercase mb-0.5">Blood Type</p>
              <p className="text-[var(--bb-ink)] font-bold">{member.blood_type}</p>
            </div>
          )}
          {member.phone && (
            <div>
              <p className="text-[10px] font-semibold text-[var(--bb-ink-muted)] uppercase mb-0.5">Phone</p>
              <p className="text-[var(--bb-ink)]">{member.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
        <h2 className="text-[14px] font-bold text-[var(--bb-ink)] mb-4">Permissions</h2>
        <div className="space-y-3">
          {([
            { key: 'can_view', icon: Eye,        label: 'View Records',      desc: 'Can see health records in your account' },
            { key: 'can_book', icon: Calendar,   label: 'Book Appointments', desc: 'Can schedule healthcare appointments' },
            { key: 'can_pay',  icon: CreditCard, label: 'Pay Bills',         desc: 'Can pay medical bills on their behalf' },
          ] as const).map(({ key, icon: Icon, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Icon size={14} color="var(--bb-ink-muted)" />
                <div>
                  <p className="text-[13px] font-medium text-[var(--bb-ink)]">{label}</p>
                  <p className="text-[11px] text-[var(--bb-ink-muted)]">{desc}</p>
                </div>
              </div>
              <button onClick={() => togglePerm(key)} role="switch"
                className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${effective[key] ? 'bg-[var(--h-teal)]' : 'bg-[var(--bb-border)]'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${effective[key] ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="mt-4 h-9 px-4 rounded-[8px] bg-[var(--h-teal)] text-white text-[12px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>
    </div>
  )
}
