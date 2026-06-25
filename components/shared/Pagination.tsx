import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  total:    number
  limit:    number
  offset:   number
  onChange: (offset: number) => void
  className?: string
}

export function Pagination({ total, limit, offset, onChange, className }: Props) {
  const page  = Math.floor(offset / limit) + 1
  const pages = Math.ceil(total / limit)
  if (pages <= 1) return null

  return (
    <div className={cn('flex items-center justify-between gap-4 py-3', className)}>
      <p className="text-[12px] text-[var(--bb-ink-muted)]">
        {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(offset - limit)}
          disabled={offset <= 0}
          className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[var(--bb-border)] text-[var(--bb-ink-soft)] hover:bg-[var(--bb-bg2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(pages, 5) }).map((_, i) => {
          const p = i + 1
          return (
            <button key={p}
              onClick={() => onChange((p - 1) * limit)}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-[8px] text-[13px] font-medium transition-colors',
                p === page
                  ? 'bg-[var(--h-teal)] text-white'
                  : 'border border-[var(--bb-border)] text-[var(--bb-ink-soft)] hover:bg-[var(--bb-bg2)]',
              )}
            >{p}</button>
          )
        })}
        <button
          onClick={() => onChange(offset + limit)}
          disabled={offset + limit >= total}
          className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[var(--bb-border)] text-[var(--bb-ink-soft)] hover:bg-[var(--bb-bg2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
