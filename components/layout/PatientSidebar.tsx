'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Search, Video, MessageSquare, FileText,
  FlaskConical, ScanLine, Pill, CreditCard, Shield, Wallet, Users, FolderOpen,
  Activity, AlertTriangle, Settings, Sparkles, ChevronLeft, ChevronRight, Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV = [
  { href: '/patient',              icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/patient/appointments', icon: Calendar,        label: 'Appointments' },
  { href: '/patient/find-care',    icon: Search,          label: 'Find Care' },
  { href: '/patient/telehealth',   icon: Video,           label: 'Telehealth' },
  { href: '/patient/messages',     icon: MessageSquare,   label: 'Messages',    badge: 'messages' },
  null, // divider
  { href: '/patient/records',      icon: FileText,        label: 'Records' },
  { href: '/patient/labs',         icon: FlaskConical,    label: 'Lab Results' },
  { href: '/patient/imaging',      icon: ScanLine,        label: 'Imaging' },
  { href: '/patient/medications',  icon: Pill,            label: 'Medications' },
  null,
  { href: '/patient/billing',      icon: CreditCard,      label: 'Billing' },
  { href: '/patient/insurance',    icon: Shield,          label: 'Insurance' },
  { href: '/patient/wallet',       icon: Wallet,          label: 'Health Wallet' },
  null,
  { href: '/patient/family',       icon: Users,           label: 'Family' },
  { href: '/patient/documents',    icon: FolderOpen,      label: 'Documents' },
  { href: '/patient/wellness',     icon: Activity,        label: 'Wellness' },
  { href: '/patient/ai',          icon: Sparkles,        label: 'Health AI' },
  { href: '/patient/emergency',    icon: AlertTriangle,   label: 'Emergency' },
  null,
  { href: '/patient/settings',     icon: Settings,        label: 'Settings' },
]

interface Props {
  unreadMessages?: number
  collapsed?: boolean
  onCollapse?: (v: boolean) => void
}

export function PatientSidebar({ unreadMessages = 0, collapsed = false, onCollapse }: Props) {
  const pathname  = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-[var(--bb-border)] flex flex-col z-30 transition-all duration-200',
        collapsed ? 'w-[64px]' : 'w-[260px]',
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-[var(--bb-border)]', collapsed && 'justify-center px-2')}>
        <div className="w-9 h-9 rounded-[10px] bg-[var(--h-teal)] flex items-center justify-center shrink-0">
          <Heart size={18} color="white" fill="white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-[13px] font-bold text-[var(--bb-ink)]">Blue Boney</p>
            <p className="text-[10px] text-[var(--bb-ink-muted)] font-medium">Health Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((item, i) => {
          if (item === null) {
            return <div key={i} className="h-px bg-[var(--bb-border)] my-2 mx-2" />
          }
          const Icon    = item.icon
          const isActive = pathname === item.href || (item.href !== '/patient' && pathname.startsWith(item.href + '/'))
          const badge   = item.badge === 'messages' && unreadMessages > 0 ? unreadMessages : null

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all mb-0.5 relative',
                isActive
                  ? 'bg-[var(--h-teal-light)] text-[var(--h-teal)]'
                  : 'text-[var(--bb-ink-soft)] hover:bg-[var(--bb-bg2)] hover:text-[var(--bb-ink)]',
                collapsed && 'justify-center px-0',
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {badge && (
                <span className={cn(
                  'bg-[var(--h-danger)] text-white text-[10px] font-bold rounded-full flex items-center justify-center',
                  collapsed ? 'absolute top-1.5 right-1.5 w-4 h-4' : 'w-5 h-5',
                )}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => onCollapse?.(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-[var(--bb-border)] text-[var(--bb-ink-muted)] hover:bg-[var(--bb-bg2)] hover:text-[var(--bb-ink)] transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-[12px] ml-1">Collapse</span></>}
      </button>
    </aside>
  )
}
