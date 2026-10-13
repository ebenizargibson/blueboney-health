// Lab result interpretation display.
//
// An interpretation is shown only when the laboratory recorded one. A missing,
// null or unrecognised value gets no badge at all: defaulting it to 'normal' would
// tell a patient their result is fine when nobody said so, and a pending result
// (which carries no interpretation) would read as good news.

/** The values health_lab_results.interpretation may hold (its CHECK constraint). */
export type LabInterpretation = 'normal' | 'abnormal' | 'high' | 'low' | 'critical'

export const LAB_COLORS: Record<LabInterpretation, { bg: string; text: string; label: string; indicator: string }> = {
  normal:   { bg: 'var(--h-success-bg)', text: 'var(--h-success)',  label: 'Normal',   indicator: '●' },
  abnormal: { bg: 'var(--h-danger-bg)',  text: 'var(--h-danger)',   label: 'Abnormal', indicator: '!' },
  high:     { bg: 'var(--h-danger-bg)',  text: 'var(--h-danger)',   label: 'High',     indicator: '↑' },
  low:      { bg: 'var(--h-warning-bg)', text: 'var(--h-warning)',  label: 'Low',      indicator: '↓' },
  critical: { bg: 'var(--h-critical-bg)',text: 'var(--h-critical)', label: 'Critical', indicator: '!!' },
}

/** The recorded interpretation if it is one we can label, otherwise null. Never a default. */
export function labInterpretation(raw: unknown): LabInterpretation | null {
  return typeof raw === 'string' && Object.prototype.hasOwnProperty.call(LAB_COLORS, raw) ? raw as LabInterpretation : null
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
