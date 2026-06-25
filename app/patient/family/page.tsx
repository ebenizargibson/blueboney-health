'use client'
import { Users, Plus, ChevronRight, Calendar, Eye, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { formatDate } from '@/lib/utils/formatters'

interface FamilyMember { id: string; first_name: string; last_name: string; relationship: string; date_of_birth?: string; blood_type?: string; can_view?: boolean; can_book?: boolean; can_pay?: boolean }

export default function FamilyPage() {
  const { data, isLoading } = useHealthData<{ members: FamilyMember[] }>('/health/family')
  const members = data?.members ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Family</h1>
          <p className="text-[13px] text-[var(--bb-ink-soft)]">Manage your family members' healthcare</p>
        </div>
        <Link href="/patient/family/add"
          className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors">
          <Plus size={15} /> Add Member
        </Link>
      </div>

      {isLoading
        ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        : members.length > 0
          ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map(m => (
                <div key={m.id} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--h-teal-light)] flex items-center justify-center">
                        <span className="text-[16px] font-bold text-[var(--h-teal)]">
                          {m.first_name[0]}{m.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[var(--bb-ink)]">{m.first_name} {m.last_name}</p>
                        <p className="text-[12px] text-[var(--bb-ink-soft)] capitalize">{m.relationship}</p>
                      </div>
                    </div>
                    <Link href={`/patient/family/${m.id}`} className="text-[var(--bb-ink-muted)] hover:text-[var(--h-teal)] transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                  {m.date_of_birth && (
                    <p className="text-[12px] text-[var(--bb-ink-muted)] mb-3">DOB: {formatDate(m.date_of_birth)}</p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {m.can_view  && <span className="chip chip-info  text-[10px]"><Eye      size={9} /> View Records</span>}
                    {m.can_book  && <span className="chip chip-teal  text-[10px]"><Calendar size={9} /> Book Visits</span>}
                    {m.can_pay   && <span className="chip chip-success text-[10px]"><CreditCard size={9} /> Pay Bills</span>}
                  </div>
                </div>
              ))}
            </div>
          : <EmptyHealthState icon={Users} title="No family members added" message="Add family members to manage their healthcare from your account." action={{ label: 'Add Member', onClick: () => window.location.href = '/patient/family/add' }} />
      }
    </div>
  )
}
