'use client'
import { Video, Clock, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyHealthState } from '@/components/health/EmptyHealthState'
import { formatDateTime, countdown } from '@/lib/utils/formatters'
import { useState, useEffect } from 'react'

interface TelehealthSession { id: string; session_token?: string; status: string; appointment_id?: string; provider_name?: string; scheduled_at?: string; started_at?: string }

function JoinCard({ s }: { s: TelehealthSession }) {
  const [cd, setCd] = useState('')
  useEffect(() => {
    if (!s.scheduled_at) return
    const interval = setInterval(() => setCd(countdown(s.scheduled_at!)), 1000)
    return () => clearInterval(interval)
  }, [s.scheduled_at])

  return (
    <div className="bg-white rounded-[14px] border-2 border-[var(--h-teal)] p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-[var(--h-teal-light)] flex items-center justify-center shrink-0">
          <Video size={20} color="var(--h-teal)" />
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-bold text-[var(--bb-ink)]">
            {s.provider_name ? `Visit with ${s.provider_name}` : 'Telehealth Visit'}
          </p>
          {s.scheduled_at && (
            <p className="text-[12px] text-[var(--bb-ink-muted)] mt-0.5">
              {formatDateTime(s.scheduled_at)}
            </p>
          )}
          {cd && <p className="text-[13px] font-semibold text-[var(--h-teal)] mt-1">{cd}</p>}
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <Link href={`/patient/telehealth/${s.id}`}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[10px] bg-[var(--h-teal)] text-white text-[14px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors">
          <Video size={16} /> Visit details
        </Link>
      </div>
    </div>
  )
}

export default function TelehealthWaitingRoomPage() {
  const { data, isLoading } = useHealthData<{ sessions: TelehealthSession[] }>('/health/telehealth/sessions')
  const sessions = data?.sessions ?? []
  const active = sessions.filter(s => ['waiting', 'active', 'scheduled'].includes(s.status))

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Telehealth</h1>
        <p className="text-[13px] text-[var(--bb-ink-soft)]">Your virtual visits and waiting room</p>
      </div>

      {isLoading
        ? <CardSkeleton />
        : active.length > 0
          ? <div className="space-y-4">{active.map(s => <JoinCard key={s.id} s={s} />)}</div>
          : (
            <EmptyHealthState
              icon={Video}
              title="No upcoming telehealth visits"
              message="Book a telehealth appointment to meet with your provider via secure video call."
              action={{ label: 'Book a Telehealth Visit', onClick: () => window.location.href = '/patient/appointments/book' }}
            />
          )
      }

      {/* Tips */}
      <div className="bg-[var(--h-info-bg)] border border-[var(--h-info)] rounded-[10px] p-4">
        <p className="text-[13px] font-semibold text-[var(--h-info)] mb-2">Before your visit</p>
        <ul className="text-[12px] text-[var(--bb-ink-soft)] space-y-1 list-disc list-inside">
          <li>Find a quiet, well-lit private location</li>
          <li>Test your camera and microphone beforehand</li>
          <li>Have your ID and insurance card ready</li>
          <li>List your current medications and symptoms</li>
        </ul>
      </div>
    </div>
  )
}
