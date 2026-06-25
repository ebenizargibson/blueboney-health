import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  message?: string
  onRetry?: () => void
  className?: string
}

export function DataError({ message, onRetry, className = '' }: Props) {
  const label = message === 'health_not_activated'
    ? 'Your health profile is not yet activated.'
    : (message ?? 'Something went wrong loading this data.')

  return (
    <div className={`flex items-start gap-3 p-4 rounded-[10px] bg-[var(--h-danger-bg)] border border-[var(--h-danger)] ${className}`}>
      <AlertTriangle size={15} color="var(--h-danger)" className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--h-danger)]">Failed to load</p>
        <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">{label}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="flex items-center gap-1 h-7 px-2.5 rounded-[6px] border border-[var(--h-danger)] text-[var(--h-danger)] text-[11px] font-semibold hover:bg-[var(--h-danger)] hover:text-white transition-colors shrink-0">
          <RefreshCw size={11} /> Retry
        </button>
      )}
    </div>
  )
}
