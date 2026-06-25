import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type AlertType = 'danger' | 'warning' | 'info' | 'success' | 'critical'

interface Props {
  type: AlertType
  title: string
  message?: string
  onDismiss?: () => void
  className?: string
  action?: { label: string; onClick: () => void }
}

const CONFIG: Record<AlertType, { bg: string; border: string; text: string; icon: typeof Info }> = {
  critical: { bg: 'var(--h-critical-bg)', border: 'var(--h-critical)', text: 'var(--h-critical)', icon: XCircle },
  danger:   { bg: 'var(--h-danger-bg)',   border: 'var(--h-danger)',   text: 'var(--h-danger)',   icon: XCircle },
  warning:  { bg: 'var(--h-warning-bg)',  border: 'var(--h-warning)',  text: 'var(--h-warning)',  icon: AlertTriangle },
  info:     { bg: 'var(--h-info-bg)',     border: 'var(--h-info)',     text: 'var(--h-info)',     icon: Info },
  success:  { bg: 'var(--h-success-bg)',  border: 'var(--h-success)',  text: 'var(--h-success)',  icon: CheckCircle },
}

export function HealthAlertBanner({ type, title, message, onDismiss, action, className }: Props) {
  const c = CONFIG[type]
  const Icon = c.icon
  return (
    <div
      className={cn('flex items-start gap-3 rounded-[10px] border p-4', className)}
      style={{ background: c.bg, borderColor: c.border }}
    >
      <Icon size={18} style={{ color: c.text, flexShrink: 0, marginTop: 1 }} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: c.text }}>{title}</p>
        {message && <p className="text-[13px] mt-0.5" style={{ color: c.text, opacity: 0.85 }}>{message}</p>}
        {action && (
          <button onClick={action.onClick} className="mt-2 text-[12px] font-semibold underline" style={{ color: c.text }}>
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 hover:opacity-70" style={{ color: c.text }}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}
