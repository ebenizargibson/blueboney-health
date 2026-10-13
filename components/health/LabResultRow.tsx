import { LAB_COLORS, labInterpretation } from '@/lib/utils/health'
import { AWAITING_REVIEW } from '@/lib/utils/results'

interface Props {
  name:            string
  value?:          string | number | null
  unit?:           string | null
  refRange?:       string | null
  /** As recorded. Anything missing or unrecognised shows no badge, never "Normal". */
  interpretation?: string | null
  comment?:        string | null
  compact?:        boolean
  /** A result not yet released: name only, and "Awaiting review". */
  pending?:        boolean
}

export function LabResultRow({ name, value, unit, refRange, interpretation, comment, compact, pending }: Props) {
  if (pending) {
    return compact
      ? <span className="text-[12px] text-[var(--bb-ink-muted)] shrink-0">{AWAITING_REVIEW}</span>
      : (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--bb-border)] last:border-0">
          <p className="text-[13px] font-medium text-[var(--bb-ink)] flex-1 min-w-0">{name}</p>
          <span className="text-[12px] font-medium text-[var(--bb-ink-muted)] shrink-0">{AWAITING_REVIEW}</span>
        </div>
      )
  }

  const known = labInterpretation(interpretation)
  const c = known ? LAB_COLORS[known] : null
  const badge = c && (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shrink-0"
      style={{ background: c.bg, color: c.text }}
    >
      <span style={{ fontSize: 9 }}>{c.indicator}</span>
      {!compact && c.label}
    </span>
  )

  if (compact) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[13px] font-semibold font-mono text-[var(--bb-ink)]">
          {value}{unit && <span className="text-[11px] font-normal text-[var(--bb-ink-muted)] ml-0.5">{unit}</span>}
        </span>
        {badge}
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--bb-border)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[var(--bb-ink)]">{name}</p>
        {refRange && <p className="text-[11px] text-[var(--bb-ink-muted)] mt-0.5">Ref: {refRange}</p>}
        {comment  && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-1 italic">{comment}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[15px] font-semibold font-mono text-[var(--bb-ink)]">
          {value}{unit && <span className="text-[11px] font-normal text-[var(--bb-ink-muted)] ml-1">{unit}</span>}
        </span>
        {badge}
      </div>
    </div>
  )
}
