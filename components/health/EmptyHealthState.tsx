import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  icon:    LucideIcon
  title:   string
  message: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyHealthState({ icon: Icon, title, message, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-[var(--bb-bg2)] flex items-center justify-center mb-4">
        <Icon size={28} color="var(--bb-ink-muted)" />
      </div>
      <h3 className="text-[16px] font-semibold text-[var(--bb-ink)] mb-2">{title}</h3>
      <p className="text-[13px] text-[var(--bb-ink-soft)] max-w-xs leading-relaxed">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 h-10 px-5 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
