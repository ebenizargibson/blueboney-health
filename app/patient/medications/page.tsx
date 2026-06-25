'use client'
import { useState } from 'react'
import { Pill } from 'lucide-react'
import { MedicationCard } from '@/components/health/MedicationCard'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { useRouter } from 'next/navigation'

interface Rx {
  id: string; medication_name: string; dosage?: string; frequency?: string;
  refills_remaining?: number; status: string; start_date?: string; end_date?: string;
  prescribing_provider?: string; instructions?: string;
}

export default function MedicationsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'current' | 'past'>('current')
  const { data: activeData, isLoading: loadingActive, mutate } = useHealthData<{ prescriptions: Rx[] }>('/health/prescriptions', { status: 'active', limit: 50 })
  const { data: pastData, isLoading: loadingPast } = useHealthData<{ prescriptions: Rx[] }>('/health/prescriptions', { status: 'expired', limit: 50 })

  const active = activeData?.prescriptions ?? []
  const past   = pastData?.prescriptions ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Medications</h1>
        <p className="text-[13px] text-[var(--bb-ink-soft)]">Your prescriptions and refill status</p>
      </div>

      <Tabs value={tab} onValueChange={v => setTab(v as 'current' | 'past')}>
        <TabsList>
          <TabsTrigger value="current">Current ({active.length})</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          {loadingActive
            ? <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            : active.length > 0
              ? <div className="space-y-3">{active.map(rx => (
                  <MedicationCard key={rx.id} prescription={rx}
                    onRefill={id => router.push(`/patient/medications/refill/${id}`)}
                    onReminder={id => alert(`Reminder feature coming soon for medication ${id}`)}
                  />
                ))}</div>
              : <EmptyHealthState icon={Pill} title="No active medications" message="Your active prescriptions will appear here." />
          }
        </TabsContent>
        <TabsContent value="past">
          {loadingPast
            ? <div className="space-y-3">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
            : past.length > 0
              ? <div className="space-y-3">{past.map(rx => <MedicationCard key={rx.id} prescription={rx} />)}</div>
              : <EmptyHealthState icon={Pill} title="No past medications" message="Expired or discontinued prescriptions will appear here." />
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}
