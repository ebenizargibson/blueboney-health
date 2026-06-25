'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, MessageSquare, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const TABS = [
  { href: '/patient',              icon: LayoutDashboard, label: 'Home' },
  { href: '/patient/appointments', icon: Calendar,        label: 'Appointments' },
  { href: '/patient/messages',     icon: MessageSquare,   label: 'Messages' },
  { href: '/patient/records',      icon: FileText,        label: 'Records' },
  { href: '/patient/settings',     icon: Settings,        label: 'Settings' },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--bb-border)] flex md:hidden z-30 safe-area-bottom">
      {TABS.map(tab => {
        const Icon     = tab.icon
        const isActive = pathname === tab.href || (tab.href !== '/patient' && pathname.startsWith(tab.href + '/'))
        return (
          <Link key={tab.href} href={tab.href}
            className={cn('flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors',
              isActive ? 'text-[var(--h-teal)]' : 'text-[var(--bb-ink-muted)]')}>
            <Icon size={20} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
