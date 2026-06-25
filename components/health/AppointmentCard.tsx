import { Calendar, Clock, MapPin, Video, ChevronRight, Phone } from 'lucide-react'
import Link from 'next/link'
import { HealthStatusBadge } from './HealthStatusBadge'
import { formatDateTime, countdown } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface Appointment {
  id:              string
  appointment_type: string
  status:          string
  scheduled_at:    string
  duration_minutes: number
  fee?:            number
  currency?:       string
  chief_complaint?: string
  health_providers?: {
    id:      string
    name:    string
    specialty?: string
    city?:   string
    profile_photo?: string
  }
}

interface Props {
  appointment: Appointment
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

export function AppointmentCard({ appointment: appt, variant = 'default', className }: Props) {
  const isTelehealth = appt.appointment_type === 'telehealth'
  const isUpcoming   = appt.status === 'confirmed' && new Date(appt.scheduled_at) > new Date()
  const provider     = appt.health_providers

  if (variant === 'compact') {
    return (
      <Link href={`/patient/appointments/${appt.id}`} className={cn('flex items-center gap-3 py-3 hover:bg-[var(--bb-bg2)] rounded-[8px] px-2 -mx-2 transition-colors', className)}>
        <div className="w-9 h-9 rounded-[8px] bg-[var(--h-teal-light)] flex items-center justify-center shrink-0">
          {isTelehealth ? <Video size={16} color="var(--h-teal)" /> : <Calendar size={16} color="var(--h-teal)" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[var(--bb-ink)] truncate">{provider?.name ?? 'Provider'}</p>
          <p className="text-[11px] text-[var(--bb-ink-soft)] truncate">{formatDateTime(appt.scheduled_at)}</p>
        </div>
        <HealthStatusBadge status={appt.status} />
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <div className={cn('bg-white rounded-[14px] border border-[var(--bb-border)] shadow-[var(--shadow)] p-5', className)}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bb-ink-muted)] mb-1">Next Appointment</p>
            <h3 className="text-[17px] font-bold text-[var(--bb-ink)]">{provider?.name ?? 'Your Provider'}</h3>
            {provider?.specialty && <p className="text-[13px] text-[var(--bb-ink-soft)]">{provider.specialty}</p>}
          </div>
          {isUpcoming && (
            <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-[var(--h-teal-light)] text-[var(--h-teal)]">
              {countdown(appt.scheduled_at)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-[13px] text-[var(--bb-ink-soft)]">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} /> {formatDateTime(appt.scheduled_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {appt.duration_minutes} min
          </span>
          {isTelehealth
            ? <span className="flex items-center gap-1.5"><Video size={13} /> Telehealth</span>
            : provider?.city && <span className="flex items-center gap-1.5"><MapPin size={13} /> {provider.city}</span>
          }
        </div>
        {appt.chief_complaint && (
          <p className="mt-3 text-[13px] text-[var(--bb-ink-soft)] bg-[var(--bb-bg2)] rounded-[8px] px-3 py-2">
            Reason: {appt.chief_complaint}
          </p>
        )}
        <div className="flex gap-2 mt-4">
          {isTelehealth && appt.status === 'confirmed' && (
            <Link href={`/patient/telehealth?appointmentId=${appt.id}`}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors">
              <Video size={14} /> Join Call
            </Link>
          )}
          <Link href={`/patient/appointments/${appt.id}`}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-[10px] border border-[var(--bb-border)] text-[var(--bb-ink)] text-[13px] font-semibold hover:bg-[var(--bb-bg2)] transition-colors">
            View Details
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Link href={`/patient/appointments/${appt.id}`}
      className={cn('block bg-white rounded-[12px] border border-[var(--bb-border)] p-4 hover:shadow-[var(--shadow)] transition-shadow', className)}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-[10px] bg-[var(--h-teal-light)] flex items-center justify-center shrink-0">
          {isTelehealth ? <Video size={18} color="var(--h-teal)" /> : <Calendar size={18} color="var(--h-teal)" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[14px] font-semibold text-[var(--bb-ink)] truncate">{provider?.name ?? 'Provider'}</p>
            <HealthStatusBadge status={appt.status} />
          </div>
          {provider?.specialty && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">{provider.specialty}</p>}
          <div className="flex items-center gap-3 mt-2 text-[12px] text-[var(--bb-ink-muted)]">
            <span className="flex items-center gap-1"><Calendar size={11} /> {formatDateTime(appt.scheduled_at)}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {appt.duration_minutes}m</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-[var(--bb-ink-muted)] shrink-0 mt-1" />
      </div>
    </Link>
  )
}
