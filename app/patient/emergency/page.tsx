'use client'
import { AlertTriangle, Phone, Heart, Pill, Droplet, MapPin, QrCode } from 'lucide-react'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'

interface HealthProfile { blood_type?: string; allergies?: string[]; emergency_contacts?: { name: string; phone: string; relationship: string }[]; chronic_conditions?: string[] }

export default function EmergencyPage() {
  const { data, isLoading } = useHealthData<{ profile: HealthProfile }>('/health/profile')
  const profile = data?.profile

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--bb-ink)]">Emergency</h1>
        <p className="text-[13px] text-[var(--bb-ink-soft)]">Critical health information for emergency responders</p>
      </div>

      {/* Emergency call button */}
      <a href="tel:911"
        className="flex items-center justify-center gap-3 h-16 rounded-[14px] bg-[var(--h-danger)] text-white text-[16px] font-bold shadow-[var(--shadow-lg)] hover:opacity-90 transition-opacity">
        <Phone size={22} fill="white" />
        Call Emergency Services (911)
      </a>

      {isLoading
        ? <div className="space-y-4">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        : (
          <>
            {/* Medical ID card */}
            <div className="bg-white rounded-[14px] border-2 border-[var(--h-danger)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={18} color="var(--h-danger)" fill="var(--h-danger)" />
                <h2 className="text-[16px] font-bold text-[var(--h-danger)]">Medical ID</h2>
                <span className="ml-auto text-[11px] text-[var(--bb-ink-muted)]">Print this page for emergencies</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--bb-ink-muted)] mb-1 flex items-center gap-1"><Droplet size={10} /> Blood Type</p>
                  <p className="text-[20px] font-extrabold text-[var(--bb-ink)]">{profile?.blood_type ?? '—'}</p>
                </div>
              </div>

              {profile?.allergies && profile.allergies.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--h-danger)] mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map((a, i) => (
                      <span key={i} className="chip chip-danger text-[11px]">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {profile?.chronic_conditions && profile.chronic_conditions.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--bb-ink-muted)] mb-2">Medical Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.chronic_conditions.map((c, i) => (
                      <span key={i} className="chip chip-warning text-[11px]">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Emergency contacts */}
            {profile?.emergency_contacts && profile.emergency_contacts.length > 0 && (
              <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-5">
                <h2 className="text-[15px] font-bold text-[var(--bb-ink)] mb-4">Emergency Contacts</h2>
                <div className="space-y-3">
                  {profile.emergency_contacts.map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{c.name}</p>
                        <p className="text-[11px] text-[var(--bb-ink-muted)] capitalize">{c.relationship}</p>
                      </div>
                      <a href={`tel:${c.phone}`}
                        className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] bg-[var(--h-teal-light)] text-[var(--h-teal)] text-[12px] font-semibold hover:bg-[var(--h-teal)] hover:text-white transition-colors">
                        <Phone size={13} /> {c.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby hospitals note */}
            <div className="bg-[var(--h-info-bg)] border border-[var(--h-info)] rounded-[10px] p-4 flex items-start gap-3">
              <MapPin size={16} color="var(--h-info)" className="shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-[var(--h-info)]">Nearest Hospitals</p>
                <p className="text-[12px] text-[var(--bb-ink-soft)] mt-0.5">
                  Use your phone's map application to find the nearest hospital or emergency room. In Liberia, call <strong>4455</strong> for ambulance services.
                </p>
              </div>
            </div>
          </>
        )
      }
    </div>
  )
}
