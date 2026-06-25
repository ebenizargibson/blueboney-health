import { Lightbulb, AlertCircle, TrendingUp, Shield } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type InsightType = 'tip' | 'alert' | 'trend' | 'recommendation'

interface Props {
  type:    InsightType
  title:   string
  message: string
  action?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

const CONFIG: Record<InsightType, { icon: typeof Lightbulb; bg: string; border: string; accent: string }> = {
  tip:            { icon: Lightbulb,    bg: 'var(--h-teal-light)',  border: 'var(--h-teal-mid)', accent: 'var(--h-teal)' },
  alert:          { icon: AlertCircle,  bg: 'var(--h-warning-bg)',  border: 'var(--h-warning)', accent: 'var(--h-warning)' },
  trend:          { icon: TrendingUp,   bg: 'var(--h-info-bg)',     border: 'var(--h-info)',    accent: 'var(--h-info)' },
  recommendation: { icon: Shield,       bg: 'var(--h-success-bg)',  border: 'var(--h-success)', accent: 'var(--h-success)' },
}

export function InsightCard({ type, title, message, action, className }: Props) {
  const c = CONFIG[type]
  const Icon = c.icon
  return (
    <div
      className={cn('rounded-[10px] border p-4', className)}
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
          style={{ background: c.accent + '20' }}>
          <Icon size={16} style={{ color: c.accent }} />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{title}</p>
          <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5 leading-relaxed">{message}</p>
          {action && (
            action.href
              ? <a href={action.href} className="mt-2 text-[12px] font-semibold" style={{ color: c.accent }}>{action.label} →</a>
              : <button onClick={action.onClick} className="mt-2 text-[12px] font-semibold" style={{ color: c.accent }}>{action.label} →</button>
          )}
        </div>
      </div>
    </div>
  )
}
