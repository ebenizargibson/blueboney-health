import { Stethoscope, FileText, Activity, TestTube, AlertCircle, User, Pill } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

type EventType = 'encounter' | 'condition' | 'observation' | 'lab' | 'referral' | 'document' | 'prescription'

interface Props {
  type:        EventType
  title:       string
  subtitle?:   string
  date:        string
  provider?:   string
  isLast?:     boolean
  className?:  string
  onClick?:    () => void
}

const EVENT_CONFIG: Record<EventType, { icon: typeof Stethoscope; bg: string; color: string; label: string }> = {
  encounter:    { icon: Stethoscope, bg: 'var(--h-teal-light)',  color: 'var(--h-teal)',    label: 'Visit' },
  condition:    { icon: AlertCircle, bg: 'var(--h-danger-bg)',   color: 'var(--h-danger)',  label: 'Condition' },
  observation:  { icon: Activity,    bg: 'var(--h-info-bg)',     color: 'var(--h-info)',    label: 'Vitals' },
  lab:          { icon: TestTube,    bg: 'var(--h-warning-bg)',  color: 'var(--h-warning)', label: 'Lab' },
  referral:     { icon: User,        bg: 'var(--h-success-bg)', color: 'var(--h-success)', label: 'Referral' },
  document:     { icon: FileText,    bg: 'var(--h-neutral-bg)', color: 'var(--h-neutral)', label: 'Document' },
  prescription: { icon: Pill,        bg: 'var(--h-teal-light)', color: 'var(--h-teal)',    label: 'Rx' },
}

export function TimelineEvent({ type, title, subtitle, date, provider, isLast, className, onClick }: Props) {
  const c = EVENT_CONFIG[type]
  const Icon = c.icon
  return (
    <div className={cn('flex gap-3 relative', className)}>
      {/* Timeline track */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-[var(--bb-border)]" />
      )}
      {/* Icon */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10"
        style={{ background: c.bg }}>
        <Icon size={16} style={{ color: c.color }} />
      </div>
      {/* Content */}
      <div
        className={cn('flex-1 pb-5 min-w-0', onClick && 'cursor-pointer')}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: c.color }}>{c.label}</span>
            </div>
            <p className="text-[13px] font-semibold text-[var(--bb-ink)] truncate">{title}</p>
            {subtitle && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5 truncate">{subtitle}</p>}
            {provider && <p className="text-[11px] text-[var(--bb-ink-muted)] mt-0.5">{provider}</p>}
          </div>
          <time className="text-[11px] text-[var(--bb-ink-muted)] shrink-0">{formatDate(date)}</time>
        </div>
      </div>
    </div>
  )
}
