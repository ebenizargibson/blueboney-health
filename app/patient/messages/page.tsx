'use client'
import { MessageSquare, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { formatRelative } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface Thread {
  id: string; subject: string; thread_type?: string; status?: string; updated_at: string;
  last_message?: string; unread_count?: number;
  provider?: { id: string; name: string; specialty?: string }
}

export default function MessagesPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useHealthData<{ threads: Thread[] }>('/health/messages/threads')
  const threads = (data?.threads ?? []).filter(t =>
    !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.provider?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Messages</h1>
          <p className="text-[13px] text-[var(--bb-ink-soft)]">Secure communication with your care team</p>
        </div>
        <Link href="/patient/messages/new"
          className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors shadow-[var(--shadow-sm)]">
          <Plus size={15} /> New Message
        </Link>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..."
          className="w-full h-10 pl-9 pr-3 rounded-[10px] border border-[var(--bb-border)] bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] transition-colors" />
      </div>

      <div className="bg-white rounded-[12px] border border-[var(--bb-border)] overflow-hidden">
        {isLoading
          ? <div className="p-4 space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
          : threads.length > 0
            ? threads.map(t => (
              <Link key={t.id} href={`/patient/messages/${t.id}`}
                className={cn('flex items-start gap-3 px-4 py-4 border-b border-[var(--bb-border)] last:border-0 hover:bg-[var(--bb-bg2)] transition-colors', (t.unread_count ?? 0) > 0 && 'bg-[var(--h-teal-light)]/30')}>
                <div className="w-10 h-10 rounded-full bg-[var(--h-teal-light)] flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-bold text-[var(--h-teal)]">
                    {(t.provider?.name ?? 'B').slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('text-[14px] truncate', (t.unread_count ?? 0) > 0 ? 'font-bold text-[var(--bb-ink)]' : 'font-medium text-[var(--bb-ink)]')}>
                      {t.subject}
                    </p>
                    <span className="text-[11px] text-[var(--bb-ink-muted)] shrink-0">{formatRelative(t.updated_at)}</span>
                  </div>
                  {t.provider && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">{t.provider.name}{t.provider.specialty ? ` · ${t.provider.specialty}` : ''}</p>}
                  {t.last_message && <p className="text-[12px] text-[var(--bb-ink-muted)] mt-1 truncate">{t.last_message}</p>}
                </div>
                {(t.unread_count ?? 0) > 0 && (
                  <div className="w-5 h-5 bg-[var(--h-danger)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-1">
                    {(t.unread_count ?? 0) > 9 ? '9+' : t.unread_count}
                  </div>
                )}
              </Link>
            ))
            : <EmptyHealthState icon={MessageSquare} title="No messages yet" message="Start a secure conversation with your care team." />
        }
      </div>
    </div>
  )
}
