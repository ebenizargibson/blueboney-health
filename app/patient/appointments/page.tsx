'use client'
import { useState } from 'react'
import { Calendar, Plus, ChevronRight, Filter } from 'lucide-react'
import Link from 'next/link'
import { AppointmentCard } from '@/components/health/AppointmentCard'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { Pagination } from '@/components/shared/Pagination'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { useRouter } from 'next/navigation'

interface Appointment {
  id: string
  appointment_type: string
  status: string
  scheduled_at: string
  duration_minutes: number
  fee?: number
  currency?: string
  chief_complaint?: string
  health_providers?: { id: string; name: string; specialty?: string; city?: string; profile_photo?: string }
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [offset, setOffset] = useState(0)
  const router = useRouter()
  const LIMIT = 10

  const isUpcoming = tab === 'upcoming'
  const { data, isLoading } = useHealthData<{ appointments: Appointment[]; count: number }>(
    '/health/appointments',
    isUpcoming
      ? { status: 'confirmed', from: new Date().toISOString(), limit: LIMIT, offset }
      : { limit: LIMIT, offset },
  )

  const appointments = data?.appointments ?? []
  const total        = data?.count ?? 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Appointments</h1>
          <p className="text-[13px] text-[var(--bb-ink-soft)]">Manage your visits and consultations</p>
        </div>
        <Link href="/patient/appointments/book"
          className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors shadow-[var(--shadow-sm)]">
          <Plus size={15} /> Book Visit
        </Link>
      </div>

      <Tabs value={tab} onValueChange={v => { setTab(v as 'upcoming' | 'past'); setOffset(0) }}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading
            ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            : appointments.length > 0
              ? <div className="space-y-3">{appointments.map(a => <AppointmentCard key={a.id} appointment={a} />)}</div>
              : <EmptyHealthState icon={Calendar} title="No upcoming appointments" message="You have no scheduled visits. Book one with your care team." action={{ label: 'Book Appointment', onClick: () => router.push('/patient/appointments/book') }} />
          }
          {total > LIMIT && <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />}
        </TabsContent>

        <TabsContent value="past">
          {isLoading
            ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            : appointments.length > 0
              ? <div className="space-y-3">{appointments.map(a => <AppointmentCard key={a.id} appointment={a} />)}</div>
              : <EmptyHealthState icon={Calendar} title="No past appointments" message="Your visit history will appear here." action={{ label: 'Book First Visit', onClick: () => router.push('/patient/appointments/book') }} />
          }
          {total > LIMIT && <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
