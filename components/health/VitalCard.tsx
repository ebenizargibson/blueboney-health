import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  label:    string
  value:    string | number
  unit?:    string
  trend?:   'up' | 'down' | 'stable'
  status?:  'normal' | 'warning' | 'danger'
  subtitle?: string
  className?: string
}

const STATUS_COLORS = {
  normal:  { bg: 'var(--h-success-bg)', border: 'var(--h-success)', value: 'var(--h-success)' },
  warning: { bg: 'var(--h-warning-bg)', border: 'var(--h-warning)', value: 'var(--h-warning)' },
  danger:  { bg: 'var(--h-danger-bg)',  border: 'var(--h-danger)',  value: 'var(--h-danger)' },
}

export function VitalCard({ label, value, unit, trend, status = 'normal', subtitle, className }: Props) {
  const c = STATUS_COLORS[status]
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'var(--h-danger)' : trend === 'down' ? 'var(--h-warning)' : 'var(--bb-ink-muted)'

  return (
    <div
      className={cn('rounded-[12px] border p-4', className)}
      style={{ background: c.bg, borderColor: c.border }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bb-ink-soft)] mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-[26px] font-bold font-mono leading-none" style={{ color: c.value }}>{value}</span>
        {unit && <span className="text-[13px] text-[var(--bb-ink-muted)] mb-0.5">{unit}</span>}
        {trend && (
          <TrendIcon size={16} style={{ color: trendColor, marginBottom: 2 }} />
        )}
      </div>
      {subtitle && <p className="text-[11px] text-[var(--bb-ink-muted)] mt-1">{subtitle}</p>}
    </div>
  )
}
