'use client'
import { use } from 'react'
import { Calendar, Clock, MapPin, Video, ArrowLeft, User, FileText } from 'lucide-react'
import Link from 'next/link'
import { HealthStatusBadge } from '@/components/health/HealthStatusBadge'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { formatDateTime } from '@/lib/utils/formatters'

interface Appt {
  id: string; appointment_type: string; status: string; scheduled_at: string;
  duration_minutes: number; fee?: number; currency?: string; chief_complaint?: string; notes?: string;
  health_providers?: { id: string; name: string; specialty?: string; city?: string; profile_photo?: string }
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, isLoading } = useHealthData<{ appointment: Appt }>(`/health/appointments/${id}`)
  const appt = data?.appointment

  if (isLoading) return <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
  if (!appt) return <div className="text-center py-16 text-[var(--bb-ink-soft)]">Appointment not found</div>

  const isTelehealth = appt.appointment_type === 'telehealth'
  const provider = appt.health_providers

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/patient/appointments" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors">
        <ArrowLeft size={14} /> Back to Appointments
      </Link>

      <div className="bg-white rounded-[14px] border border-[var(--bb-border)] p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="text-[20px] font-bold text-[var(--bb-ink)]">
              {isTelehealth ? 'Telehealth Visit' : 'In-Person Visit'}
            </h1>
            {provider && <p className="text-[14px] text-[var(--bb-ink-soft)] mt-0.5">{provider.name}{provider.specialty ? ` · ${provider.specialty}` : ''}</p>}
          </div>
          <HealthStatusBadge status={appt.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex items-center gap-2.5 text-[13px] text-[var(--bb-ink)]">
            <Calendar size={15} color="var(--h-teal)" />
            <span>{formatDateTime(appt.scheduled_at)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-[var(--bb-ink)]">
            <Clock size={15} color="var(--h-teal)" />
            <span>{appt.duration_minutes} minutes</span>
          </div>
          {isTelehealth
            ? <div className="flex items-center gap-2.5 text-[13px] text-[var(--bb-ink)]"><Video size={15} color="var(--h-teal)" /><span>Telehealth</span></div>
            : provider?.city && <div className="flex items-center gap-2.5 text-[13px] text-[var(--bb-ink)]"><MapPin size={15} color="var(--h-teal)" /><span>{provider.city}</span></div>
          }
          {appt.fee && (
            <div className="flex items-center gap-2.5 text-[13px] text-[var(--bb-ink)]">
              <span className="text-[var(--h-teal)] font-semibold">{appt.currency ?? 'LRD'} {appt.fee.toLocaleString()}</span>
            </div>
          )}
        </div>

        {appt.chief_complaint && (
          <div className="bg-[var(--bb-bg2)] rounded-[10px] p-4 mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bb-ink-muted)] mb-1">Reason for Visit</p>
            <p className="text-[14px] text-[var(--bb-ink)]">{appt.chief_complaint}</p>
          </div>
        )}
        {appt.notes && (
          <div className="bg-[var(--bb-bg2)] rounded-[10px] p-4 mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bb-ink-muted)] mb-1">Notes</p>
            <p className="text-[14px] text-[var(--bb-ink)]">{appt.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          {isTelehealth && appt.status === 'confirmed' && new Date(appt.scheduled_at) <= new Date(Date.now() + 15 * 60 * 1000) && (
            <Link href={`/patient/telehealth?appointmentId=${appt.id}`}
              className="flex items-center gap-2 h-10 px-5 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors">
              <Video size={14} /> Join Call
            </Link>
          )}
          {provider && (
            <Link href={`/patient/messages?providerId=${provider.id}&subject=Re: Appointment ${new Date(appt.scheduled_at).toLocaleDateString()}`}
              className="flex items-center gap-2 h-10 px-5 rounded-[10px] border border-[var(--bb-border)] text-[var(--bb-ink)] text-[13px] font-semibold hover:bg-[var(--bb-bg2)] transition-colors">
              <User size={14} /> Message Provider
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
