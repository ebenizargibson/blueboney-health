import { Pill, RefreshCw, Bell, Clock } from 'lucide-react'
import { HealthStatusBadge } from './HealthStatusBadge'
import { formatDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface Prescription {
  id:           string
  medication_name: string
  dosage?:      string
  frequency?:   string
  refills_remaining?: number
  status:       string
  start_date?:  string
  end_date?:    string
  prescribing_provider?: string
  instructions?: string
}

interface Props {
  prescription: Prescription
  onRefill?:    (id: string) => void
  onReminder?:  (id: string) => void
  className?:   string
}

export function MedicationCard({ prescription: rx, onRefill, onReminder, className }: Props) {
  const isActive  = rx.status === 'active' || rx.status === 'prescribed'
  const isExpired = rx.status === 'expired'

  return (
    <div className={cn('bg-white rounded-[12px] border border-[var(--bb-border)] p-4', !isActive && 'opacity-70', className)}>
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0',
          isActive ? 'bg-[var(--h-teal-light)]' : 'bg-[var(--bb-bg2)]')}>
          <Pill size={18} color={isActive ? 'var(--h-teal)' : 'var(--bb-ink-muted)'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{rx.medication_name}</p>
              {rx.dosage && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">{rx.dosage}</p>}
            </div>
            <HealthStatusBadge status={rx.status} />
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {rx.frequency && (
              <span className="flex items-center gap-1 text-[11px] text-[var(--bb-ink-muted)]">
                <Clock size={10} /> {rx.frequency}
              </span>
            )}
            {rx.end_date && (
              <span className="text-[11px] text-[var(--bb-ink-muted)]">
                Until {formatDate(rx.end_date)}
              </span>
            )}
            {rx.refills_remaining !== undefined && (
              <span className={cn('text-[11px] font-medium', rx.refills_remaining === 0 ? 'text-[var(--h-danger)]' : 'text-[var(--bb-ink-soft)]')}>
                {rx.refills_remaining} refill{rx.refills_remaining !== 1 ? 's' : ''} left
              </span>
            )}
          </div>
          {rx.prescribing_provider && (
            <p className="mt-1 text-[11px] text-[var(--bb-ink-muted)]">Prescribed by {rx.prescribing_provider}</p>
          )}
          {rx.instructions && (
            <p className="mt-2 text-[12px] text-[var(--bb-ink-soft)] bg-[var(--bb-bg2)] rounded-[6px] px-2.5 py-1.5">{rx.instructions}</p>
          )}
          {isActive && (
            <div className="flex gap-2 mt-3">
              {onRefill && (rx.refills_remaining ?? 1) > 0 && (
                <button onClick={() => onRefill(rx.id)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--bb-border)] text-[12px] font-medium text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors">
                  <RefreshCw size={12} /> Refill
                </button>
              )}
              {onReminder && (
                <button onClick={() => onReminder(rx.id)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--bb-border)] text-[12px] font-medium text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors">
                  <Bell size={12} /> Remind
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
