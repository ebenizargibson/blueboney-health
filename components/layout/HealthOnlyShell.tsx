'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Heart, LogOut } from 'lucide-react'
import { portalAuth } from '@/lib/api'

/**
 * The portal for a patient signed in with their health record and no banking
 * account (P2). Only the pages whose backend routes read a health session are
 * here: the rest (appointments, billing, wallet, messages) still need a banking
 * session until P4 moves them.
 */
const NAV = [
  { href: '/patient',             label: 'Home' },
  { href: '/patient/labs',        label: 'Lab results' },
  { href: '/patient/medications', label: 'Medicines' },
]

export function HealthOnlyShell({ fullName, children }: { fullName: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [leaving, setLeaving] = useState(false)
  const signOut = async () => {
    setLeaving(true)
    await portalAuth.logout()
    router.push('/login')
  }
  return (
    <div className="min-h-screen bg-[var(--bb-bg)]">
      <header className="bg-white border-b border-[var(--bb-border)]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="w-9 h-9 rounded-[10px] bg-[var(--h-teal)] flex items-center justify-center">
            <Heart size={16} color="white" fill="white" />
          </div>
          <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
            {NAV.map(n => (
              <Link key={n.href} href={n.href}
                className={`px-3 py-1.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap ${
                  pathname === n.href ? 'bg-[var(--bb-bg2)] text-[var(--bb-ink)]' : 'text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)]'}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <span className="hidden sm:block text-[13px] text-[var(--bb-ink-soft)]">{fullName}</span>
          <button onClick={signOut} disabled={leaving} aria-label="Sign out"
            className="flex items-center gap-1.5 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] disabled:opacity-60">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  )
}
