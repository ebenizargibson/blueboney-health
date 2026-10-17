'use client'
import { AlertTriangle, Pill, Activity, Syringe } from 'lucide-react'

export interface ClinicalSummary {
  active_conditions?:  { id: string; display?: string | null; severity?: string | null; onset_date?: string | null }[]
  allergies?:          { id: string; allergen_name?: string | null; criticality?: string | null }[]
  active_medications?: { id: string; medication_name?: string | null; strength?: string | null; frequency?: string | null }[]
  immunizations?:      { id: string; vaccine_name?: string | null; administered_at?: string | null; dose_number?: number | null }[]
}

function Section({ title, icon, empty, children }: { title: string; icon: React.ReactNode; empty: boolean; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-[14px] border border-[var(--bb-border)] p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-[14px] font-bold text-[var(--bb-ink)]">{title}</h3>
      </div>
      {/* "Nothing recorded" is a statement about the record, not about the patient. */}
      {empty ? <p className="text-[13px] text-[var(--bb-ink-muted)]">Nothing recorded at a clinic yet.</p> : children}
    </section>
  )
}

/** A chart's summary as the clinic recorded it: conditions, allergies, medicines, vaccines. */
export function ChartSummary({ summary }: { summary: ClinicalSummary }) {
  const conditions = summary.active_conditions ?? []
  const allergies = summary.allergies ?? []
  const meds = summary.active_medications ?? []
  const vaccines = summary.immunizations ?? []
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Section title="Allergies" icon={<AlertTriangle size={16} className="text-[var(--h-danger)]" />} empty={allergies.length === 0}>
        <ul className="space-y-1.5">
          {allergies.map(a => (
            <li key={a.id} className="text-[13px] text-[var(--bb-ink)]">
              {a.allergen_name}{a.criticality === 'high' && <span className="ml-2 text-[11px] font-semibold text-[var(--h-danger)]">High risk</span>}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Conditions" icon={<Activity size={16} className="text-[var(--h-teal)]" />} empty={conditions.length === 0}>
        <ul className="space-y-1.5">
          {conditions.map(c => <li key={c.id} className="text-[13px] text-[var(--bb-ink)]">{c.display}</li>)}
        </ul>
      </Section>
      <Section title="Medicines" icon={<Pill size={16} className="text-[var(--h-teal)]" />} empty={meds.length === 0}>
        <ul className="space-y-1.5">
          {meds.map(m => (
            <li key={m.id} className="text-[13px] text-[var(--bb-ink)]">
              {m.medication_name}{m.strength ? ` ${m.strength}` : ''}{m.frequency ? ` · ${m.frequency}` : ''}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Vaccines" icon={<Syringe size={16} className="text-[var(--h-teal)]" />} empty={vaccines.length === 0}>
        <ul className="space-y-1.5">
          {vaccines.map(v => (
            <li key={v.id} className="text-[13px] text-[var(--bb-ink)]">
              {v.vaccine_name}{v.dose_number ? ` (dose ${v.dose_number})` : ''}
              {v.administered_at && <span className="text-[var(--bb-ink-muted)]"> · {v.administered_at.slice(0, 10)}</span>}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
