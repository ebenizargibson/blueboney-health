import { cn } from '@/lib/utils/cn'
import { APPOINTMENT_COLORS } from '@/lib/utils/health'

interface Props {
  status: string
  className?: string
}

const STATUS_LABELS: Record<string, string> = {
  confirmed:   'Confirmed',
  pending:     'Pending',
  cancelled:   'Cancelled',
  completed:   'Completed',
  no_show:     'No Show',
  in_progress: 'In Progress',
  active:      'Active',
  inactive:    'Inactive',
  expired:     'Expired',
  filled:      'Filled',
  pending_fill:'Pending Fill',
  prescribed:  'Prescribed',
  approved:    'Approved',
  denied:      'Denied',
  submitted:   'Submitted',
}

export function HealthStatusBadge({ status, className }: Props) {
  const colors = APPOINTMENT_COLORS[status] ?? { bg: 'var(--h-neutral-bg)', text: 'var(--h-neutral)', dot: '●' }
  const label  = STATUS_LABELS[status] ?? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', className)}
      style={{ background: colors.bg, color: colors.text }}
    >
      <span style={{ fontSize: 8 }}>{colors.dot}</span>
      {label}
    </span>
  )
}
