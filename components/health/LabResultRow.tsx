import { LAB_COLORS, type LabInterpretation } from '@/lib/utils/health'

interface Props {
  name:        string
  value:       string | number
  unit:        string
  refRange?:   string
  interpretation: LabInterpretation
  comment?:    string
}

export function LabResultRow({ name, value, unit, refRange, interpretation, comment }: Props) {
  const c = LAB_COLORS[interpretation]
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--bb-border)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[var(--bb-ink)]">{name}</p>
        {refRange && <p className="text-[11px] text-[var(--bb-ink-muted)] mt-0.5">Ref: {refRange}</p>}
        {comment && <p className="text-[12px] text-[var(--bb-ink-soft)] mt-1 italic">{comment}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[15px] font-semibold font-mono text-[var(--bb-ink)]">
          {value} <span className="text-[11px] font-normal text-[var(--bb-ink-muted)]">{unit}</span>
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ background: c.bg, color: c.text }}
        >
          <span style={{ fontSize: 9 }}>{c.indicator}</span>
          {c.label}
        </span>
      </div>
    </div>
  )
}
