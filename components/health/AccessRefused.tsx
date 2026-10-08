'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, LogOut } from 'lucide-react'
import { portalAuth } from '@/lib/api'
import type { AccessRefusal } from '@/lib/accessRefused'

// Used only if the backend sent no sentence. Deliberately the same neutral words:
// it says what cannot happen and where to go, never why.
const FALLBACK = "We can't open health records for this account. Please visit your clinic or contact support."

/** The whole patient area, for an account the backend refuses. No retry, no activation. */
export function AccessRefused({ refusal }: { refusal: AccessRefusal }) {
  const router = useRouter()
  const [leaving, setLeaving] = useState(false)

  const signOut = async () => {
    setLeaving(true)
    await portalAuth.logout().catch(() => null)
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--bb-bg)] flex items-center justify-center p-4">
      <div role="alert" className="w-full max-w-[460px] bg-white rounded-[16px] border border-[var(--bb-border)] p-6 space-y-4 text-center">
        <div className="w-12 h-12 rounded-[12px] bg-[var(--bb-bg2)] flex items-center justify-center mx-auto">
          <Heart size={22} color="var(--bb-ink-muted)" />
        </div>
        <p className="text-[15px] text-[var(--bb-ink)] leading-relaxed">{refusal.message ?? FALLBACK}</p>
        {refusal.reference && (
          <div className="rounded-[10px] bg-[var(--bb-bg2)] px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--bb-ink-muted)]">Reference</p>
            <p className="text-[13px] font-mono text-[var(--bb-ink)] break-all select-all">{refusal.reference}</p>
          </div>
        )}
        <button onClick={signOut} disabled={leaving}
          className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-[8px] border border-[var(--bb-border)] text-[13px] font-medium text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors disabled:opacity-60">
          <LogOut size={14} /> {leaving ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
