import Link from 'next/link'
import { Heart, Shield, Activity, Users, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] via-[#F8FAFC] to-[#ECFEFF] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-[var(--bb-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[var(--h-teal)] flex items-center justify-center">
            <Heart size={18} color="white" fill="white" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-[var(--bb-ink)]">Blue Boney Health</p>
            <p className="text-[10px] text-[var(--bb-ink-muted)]">Secure Patient Portal</p>
          </div>
        </div>
        <Link href="/login"
          className="h-9 px-4 rounded-[10px] bg-[var(--h-teal)] text-white text-[13px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors flex items-center gap-1.5">
          Patient Login <ArrowRight size={13} />
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-20 h-20 rounded-[20px] bg-[var(--h-teal)] flex items-center justify-center mb-8 shadow-[var(--shadow-lg)]">
          <Heart size={36} color="white" fill="white" />
        </div>
        <h1 className="text-[36px] font-extrabold text-[var(--bb-ink)] mb-4 max-w-xl leading-tight">
          Your Health, <span className="text-[var(--h-teal)]">One Place</span>
        </h1>
        <p className="text-[16px] text-[var(--bb-ink-soft)] max-w-lg mb-10 leading-relaxed">
          Appointments, medical records, lab results, prescriptions, billing, and more — all in one secure, easy-to-use portal.
        </p>
        <Link href="/login"
          className="h-12 px-8 rounded-[12px] bg-[var(--h-teal)] text-white text-[15px] font-bold hover:bg-[var(--h-teal-hover)] transition-colors flex items-center gap-2 shadow-[var(--shadow)]">
          Access Your Portal <ArrowRight size={16} />
        </Link>

        {/* Feature grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-2xl w-full">
          {[
            { icon: Activity,  label: 'Health Records',  desc: 'FHIR-aligned timeline' },
            { icon: Shield,    label: 'Secure & Private', desc: 'HIPAA-compliant' },
            { icon: Users,     label: 'Family Care',      desc: 'Manage family members' },
            { icon: Heart,     label: 'Telehealth',       desc: 'Video visits' },
          ].map(f => (
            <div key={f.label} className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4 text-center shadow-[var(--shadow-sm)]">
              <f.icon size={22} className="mx-auto mb-2" style={{ color: 'var(--h-teal)' }} />
              <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{f.label}</p>
              <p className="text-[11px] text-[var(--bb-ink-muted)] mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-[12px] text-[var(--bb-ink-muted)] border-t border-[var(--bb-border)]">
        © 2026 Blue Boney · All health data is encrypted and HIPAA-compliant
      </footer>
    </div>
  )
}
