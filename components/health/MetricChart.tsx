'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DataPoint {
  date:  string
  value: number
}

interface Props {
  data:        DataPoint[]
  label:       string
  unit?:       string
  color?:      string
  normalLow?:  number
  normalHigh?: number
  height?:     number
}

function CustomTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[var(--bb-border)] rounded-[8px] shadow-[var(--shadow)] px-3 py-2">
      <p className="text-[11px] text-[var(--bb-ink-muted)]">{label}</p>
      <p className="text-[14px] font-semibold text-[var(--bb-ink)]">{payload[0].value}{unit ? ` ${unit}` : ''}</p>
    </div>
  )
}

export function MetricChart({ data, label, unit, color = 'var(--h-teal)', normalLow, normalHigh, height = 180 }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-[13px] text-[var(--bb-ink-muted)]" style={{ height }}>
        No data yet
      </div>
    )
  }
  return (
    <div>
      <p className="text-[12px] font-medium text-[var(--bb-ink-soft)] mb-2">{label}{unit ? ` (${unit})` : ''}</p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--bb-ink-muted)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--bb-ink-muted)' }} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          {normalLow  !== undefined && <ReferenceLine y={normalLow}  stroke="var(--h-warning)" strokeDasharray="4 4" />}
          {normalHigh !== undefined && <ReferenceLine y={normalHigh} stroke="var(--h-danger)"  strokeDasharray="4 4" />}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
