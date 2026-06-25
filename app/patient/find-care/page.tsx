'use client'
import { useState } from 'react'
import { Search, SlidersHorizontal, Video } from 'lucide-react'
import { ProviderCard } from '@/components/health/ProviderCard'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { Pagination } from '@/components/shared/Pagination'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { useRouter } from 'next/navigation'

interface Provider { id: string; name: string; specialty?: string; provider_type?: string; city?: string; consultation_fee?: number; currency?: string; telehealth_available?: boolean; accepting_new_patients?: boolean; profile_photo?: string; bio?: string }

export default function FindCarePage() {
  const [search,     setSearch]     = useState('')
  const [telehealth, setTelehealth] = useState(false)
  const [offset,     setOffset]     = useState(0)
  const router = useRouter()
  const LIMIT = 12

  const { data, isLoading } = useHealthData<{ providers: Provider[]; count: number }>(
    '/health/providers',
    { specialty: search || undefined, telehealth_only: telehealth ? '1' : undefined, limit: LIMIT, offset },
  )
  const providers = data?.providers ?? []
  const total     = data?.count ?? 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Find Care</h1>
        <p className="text-[13px] text-[var(--bb-ink-soft)]">Discover providers in Blue Boney Health network</p>
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setOffset(0) }}
            placeholder="Search specialty, name..."
            className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] transition-colors" />
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[var(--bb-ink)] cursor-pointer">
          <input type="checkbox" checked={telehealth} onChange={e => { setTelehealth(e.target.checked); setOffset(0) }}
            className="accent-[var(--h-teal)]" />
          <Video size={13} color="var(--h-teal)" /> Telehealth only
        </label>
        <p className="text-[12px] text-[var(--bb-ink-muted)]">{total} providers found</p>
      </div>

      {/* Results */}
      {isLoading
        ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <CardSkeleton key={i} />)}</div>
        : providers.length > 0
          ? <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map(p => (
                  <ProviderCard key={p.id} provider={p} onBook={id => router.push(`/patient/appointments/book?providerId=${id}`)} />
                ))}
              </div>
              {total > LIMIT && <Pagination total={total} limit={LIMIT} offset={offset} onChange={setOffset} />}
            </>
          : <EmptyHealthState icon={Search} title="No providers found" message="Try a different search term or remove filters." />
      }
    </div>
  )
}
