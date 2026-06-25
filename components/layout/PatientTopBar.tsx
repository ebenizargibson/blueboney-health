'use client'
import { Bell, Search, LogOut, Settings, ChevronDown, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { portalAuth } from '@/lib/api'
import { useRouter } from 'next/navigation'
import type { ClientSession } from '@/lib/hooks/usePatientSession'

interface Props {
  session:         ClientSession
  unreadMessages?: number
  sidebarCollapsed?: boolean
}

export function PatientTopBar({ session, unreadMessages = 0, sidebarCollapsed }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoggingOut(true)
    await portalAuth.logout()
    router.push('/login')
  }

  const initials = session.fullName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <header
      className="fixed right-0 top-0 h-16 bg-white border-b border-[var(--bb-border)] flex items-center gap-4 px-5 z-20 transition-all duration-200"
      style={{ left: sidebarCollapsed ? 64 : 260 }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)]" />
        <input
          type="text"
          placeholder="Search records, providers, appointments..."
          className="w-full h-9 pl-9 pr-3 rounded-[8px] bg-[var(--bb-bg2)] border border-[var(--bb-border)] text-[13px] text-[var(--bb-ink)] placeholder:text-[var(--bb-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] focus:border-[var(--h-teal)] transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <Link href="/patient/messages" className="relative w-9 h-9 flex items-center justify-center rounded-[8px] hover:bg-[var(--bb-bg2)] transition-colors">
          <Bell size={18} className="text-[var(--bb-ink-soft)]" />
          {unreadMessages > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[var(--h-danger)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 h-9 px-2.5 rounded-[8px] hover:bg-[var(--bb-bg2)] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--h-teal)] flex items-center justify-center">
              <span className="text-white text-[11px] font-bold">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-semibold text-[var(--bb-ink)] leading-none">{session.fullName}</p>
              <p className="text-[10px] text-[var(--bb-ink-muted)] mt-0.5 capitalize">{session.tier} Plan</p>
            </div>
            <ChevronDown size={13} className="text-[var(--bb-ink-muted)] hidden sm:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 w-52 bg-white rounded-[12px] border border-[var(--bb-border)] shadow-[var(--shadow-lg)] z-20 py-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--bb-border)]">
                  <p className="text-[13px] font-semibold text-[var(--bb-ink)]">{session.fullName}</p>
                  <p className="text-[11px] text-[var(--bb-ink-muted)]">{session.phone}</p>
                </div>
                <Link href="/patient/settings" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors">
                  <Settings size={14} /> Settings
                </Link>
                <Link href="/patient/settings/security" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--bb-ink)] hover:bg-[var(--bb-bg2)] transition-colors">
                  <User size={14} /> Profile
                </Link>
                <div className="h-px bg-[var(--bb-border)] my-1" />
                <button onClick={handleLogout} disabled={loggingOut}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--h-danger)] hover:bg-[var(--h-danger-bg)] transition-colors w-full text-left disabled:opacity-50">
                  <LogOut size={14} /> {loggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
