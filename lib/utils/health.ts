// Lab result reference ranges and interpretation helpers

export type LabInterpretation = 'normal' | 'high' | 'low' | 'critical'

export function interpretLab(value: number | null, low: number, high: number, critLow?: number, critHigh?: number): LabInterpretation {
  if (value === null) return 'normal'
  if (critLow !== undefined && value < critLow) return 'critical'
  if (critHigh !== undefined && value > critHigh) return 'critical'
  if (value < low) return 'low'
  if (value > high) return 'high'
  return 'normal'
}

export const LAB_COLORS: Record<LabInterpretation, { bg: string; text: string; label: string; indicator: string }> = {
  normal:   { bg: 'var(--h-success-bg)', text: 'var(--h-success)',  label: 'Normal',   indicator: '●' },
  high:     { bg: 'var(--h-danger-bg)',  text: 'var(--h-danger)',   label: 'High',     indicator: '↑' },
  low:      { bg: 'var(--h-warning-bg)', text: 'var(--h-warning)',  label: 'Low',      indicator: '↓' },
  critical: { bg: 'var(--h-critical-bg)',text: 'var(--h-critical)', label: 'Critical', indicator: '!!' },
}

export const APPOINTMENT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  confirmed:  { bg: 'var(--h-success-bg)',  text: 'var(--h-success)',  dot: '●' },
  pending:    { bg: 'var(--h-warning-bg)',  text: 'var(--h-warning)',  dot: '◌' },
  cancelled:  { bg: 'var(--h-danger-bg)',   text: 'var(--h-danger)',   dot: '✕' },
  completed:  { bg: 'var(--h-neutral-bg)',  text: 'var(--h-neutral)',  dot: '✓' },
  no_show:    { bg: 'var(--h-danger-bg)',   text: 'var(--h-danger)',   dot: '✕' },
  in_progress:{ bg: 'var(--h-teal-light)',  text: 'var(--h-teal)',     dot: '●' },
}

export const MOOD_ICONS: Record<string, string> = {
  great: '😄',
  good:  '🙂',
  okay:  '😐',
  low:   '😕',
  bad:   '😞',
}

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const
export const RELATIONSHIPS = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Grandchild', 'Guardian', 'Other'] as const
export const APPOINTMENT_TYPES = ['in_person', 'telehealth', 'home_visit'] as const
export const DOCUMENT_CATEGORIES = [
  'insurance_card', 'medical_form', 'prescription', 'consent_form',
  'visit_summary', 'vaccination_record', 'lab_report', 'imaging', 'other',
] as const

export function appointmentTypeLabel(t: string): string {
  return { in_person: 'In Person', telehealth: 'Telehealth', home_visit: 'Home Visit' }[t] ?? t
}

export function statusColor(status: string) {
  return APPOINTMENT_COLORS[status] ?? APPOINTMENT_COLORS['pending']
}
