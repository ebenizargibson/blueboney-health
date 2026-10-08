'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MessageSquare, RefreshCw, CreditCard, FileText, FlaskConical, Pill, Heart, ChevronRight, AlertTriangle, TrendingUp, Users, Wallet } from 'lucide-react'
import Link from 'next/link'
import { AppointmentCard } from '@/components/health/AppointmentCard'
import { LabResultRow } from '@/components/health/LabResultRow'
import { InsightCard } from '@/components/health/InsightCard'
import { HealthAlertBanner } from '@/components/health/HealthAlertBanner'
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton'
import { useHealthData } from '@/lib/hooks/useHealthData'
import { usePatientSession } from '@/lib/hooks/usePatientSession'
import { formatCurrency, formatRelative } from '@/lib/utils/formatters'
import { isPending, labOrderTitle, type LabOrder } from '@/lib/utils/results'

export default function DashboardPage() {
  const router = useRouter()
  const { session } = usePatientSession()
  const { data: status, isLoading } = useHealthData<{ activated: boolean; profile?: { first_name?: string } }>('/health/status')

  useEffect(() => {
    if (status && !status.activated) router.replace('/patient/activate')
  }, [status, router])
  const { data: apptData } = useHealthData<{ appointments: unknown[] }>('/health/appointments', { status: 'confirmed', limit: '1' })
  const { data: msgData } = useHealthData<{ threads: { id: string; subject: string; last_message?: string; updated_at: string; unread_count?: number; provider?: { name: string } }[] }>('/health/messages/threads')
  const { data: labData } = useHealthData<{ orders: LabOrder[] }>('/health/labs', { limit: '3' })
  const { data: rxData } = useHealthData<{ prescriptions: { id: string; medication_name: string; status: string; refills_remaining?: number }[] }>('/health/prescriptions', { status: 'active', limit: '5' })
  const { data: walletData } = useHealthData<{ wallet?: { balance: number; currency: string } }>('/health/wallet')

  if (isLoading) return <DashboardSkeleton />

  if (!status?.activated && !isLoading) return null // redirecting to /patient/activate

  const firstName = status?.profile?.first_name ?? session?.fullName.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const upcomingAppt = (apptData?.appointments ?? [])[0] as Parameters<typeof AppointmentCard>[0]['appointment'] | undefined
  const threads = msgData?.threads ?? []
  const unreadCount = threads.reduce((n, t) => n + (t.unread_count ?? 0), 0)
  const labOrders = labData?.orders ?? []
  const prescriptions = rxData?.prescriptions ?? []
  const pendingRefills = prescriptions.filter(r => (r.refills_remaining ?? 1) === 0).length
  const walletBalance = walletData?.wallet?.balance ?? 0

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-[var(--bb-ink)]">{greeting}, {firstName}</h1>
          <p className="text-[13px] text-[var(--bb-ink-soft)] mt-0.5">
            {new Date().toLocaleDateString('en-LR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-white border border-[var(--bb-border)] rounded-[10px] px-3 py-2 shadow-[var(--shadow-sm)]">
            <div className="w-6 h-6 rounded-full bg-[var(--h-teal-light)] flex items-center justify-center">
              <Heart size={12} color="var(--h-teal)" fill="var(--h-teal)" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--bb-ink-muted)] uppercase tracking-wide">Health Score</p>
              <p className="text-[14px] font-bold text-[var(--h-teal)]">—</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical alert: pending refills */}
      {pendingRefills > 0 && (
        <HealthAlertBanner
          type="warning"
          title={`${pendingRefills} prescription${pendingRefills > 1 ? 's' : ''} need a refill`}
          message="Contact your provider or request a refill below."
          action={{ label: 'View Medications', onClick: () => window.location.href = '/patient/medications' }}
        />
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Calendar,     label: 'Book Appointment', href: '/patient/appointments/book', color: 'var(--h-teal)' },
          { icon: MessageSquare,label: 'Message Care Team', href: '/patient/messages',          color: 'var(--bb-blue)' },
          { icon: RefreshCw,    label: 'Refill Medication', href: '/patient/medications',       color: 'var(--h-success)' },
          { icon: CreditCard,   label: 'Pay Bill',          href: '/patient/billing',           color: 'var(--h-warning)' },
        ].map(action => (
          <Link key={action.label} href={action.href}
            className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4 flex flex-col items-center gap-2 text-center hover:shadow-[var(--shadow)] hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: action.color + '15' }}>
              <action.icon size={18} style={{ color: action.color }} />
            </div>
            <p className="text-[12px] font-semibold text-[var(--bb-ink)]">{action.label}</p>
          </Link>
        ))}
      </div>

      {/* Health summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: FileText,    label: 'Records',       value: '—',           href: '/patient/records',   color: 'var(--h-info)' },
          { icon: Pill,        label: 'Active Rx',     value: prescriptions.length, href: '/patient/medications', color: 'var(--h-teal)' },
          { icon: MessageSquare, label: 'Unread Msgs', value: unreadCount,   href: '/patient/messages',  color: unreadCount > 0 ? 'var(--h-danger)' : 'var(--bb-ink-muted)' },
          { icon: TrendingUp,  label: 'Wallet',        value: formatCurrency(walletBalance), href: '/patient/wallet', color: 'var(--h-success)' },
        ].map(item => (
          <Link key={item.label} href={item.href}
            className="bg-white rounded-[12px] border border-[var(--bb-border)] p-4 hover:shadow-[var(--shadow)] transition-shadow">
            <item.icon size={16} style={{ color: item.color }} />
            <p className="text-[20px] font-bold text-[var(--bb-ink)] mt-2">{item.value}</p>
            <p className="text-[11px] text-[var(--bb-ink-muted)] mt-0.5">{item.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming appointment */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-[var(--bb-ink)]">Next Appointment</h2>
            <Link href="/patient/appointments" className="text-[12px] text-[var(--h-teal)] font-medium flex items-center gap-0.5 hover:underline">
              All <ChevronRight size={12} />
            </Link>
          </div>
          {upcomingAppt
            ? <AppointmentCard appointment={upcomingAppt} variant="featured" />
            : (
              <div className="bg-white rounded-[12px] border border-[var(--bb-border)] p-6 text-center">
                <Calendar size={28} className="mx-auto mb-3 text-[var(--bb-ink-muted)]" />
                <p className="text-[14px] font-semibold text-[var(--bb-ink)]">No upcoming appointments</p>
                <p className="text-[12px] text-[var(--bb-ink-soft)] mt-1 mb-4">Schedule a visit with your care team</p>
                <Link href="/patient/appointments/book"
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[8px] bg-[var(--h-teal)] text-white text-[12px] font-semibold hover:bg-[var(--h-teal-hover)] transition-colors">
                  Book Appointment
                </Link>
              </div>
            )
          }
        </section>

        {/* Recent lab results */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-[var(--bb-ink)]">Recent Lab Results</h2>
            <Link href="/patient/labs" className="text-[12px] text-[var(--h-teal)] font-medium flex items-center gap-0.5 hover:underline">
              All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="bg-white rounded-[12px] border border-[var(--bb-border)]">
            {labOrders.some(o => (o.health_lab_results ?? []).length > 0)
              ? labOrders.flatMap(order =>
                  (order.health_lab_results ?? []).slice(0, 2).map(r => (
                    <div key={r.id} className="px-4">
                      {isPending(r)
                        ? <LabResultRow name={r.test_name ?? labOrderTitle(order)} pending />
                        : (
                          <LabResultRow
                            name={r.test_name}
                            value={r.value}
                            unit={r.unit}
                            refRange={r.reference_range}
                            interpretation={r.interpretation}
                          />
                        )}
                    </div>
                  ))
                ).slice(0, 4)
              : (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <FlaskConical size={28} className="text-[var(--bb-ink-muted)] mb-3" />
                  <p className="text-[14px] font-semibold text-[var(--bb-ink)]">No lab results yet</p>
                  <p className="text-[12px] text-[var(--bb-ink-soft)] mt-1">Results will appear here when your labs are processed</p>
                </div>
              )
            }
          </div>
        </section>

        {/* Messages */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-[var(--bb-ink)]">Messages</h2>
            <Link href="/patient/messages" className="text-[12px] text-[var(--h-teal)] font-medium flex items-center gap-0.5 hover:underline">
              All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="bg-white rounded-[12px] border border-[var(--bb-border)] divide-y divide-[var(--bb-border)]">
            {threads.length > 0
              ? threads.slice(0, 3).map(t => (
                <Link key={t.id} href={`/patient/messages/${t.id}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bb-bg2)] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[var(--h-teal-light)] flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-[var(--h-teal)]">
                      {(t.provider?.name ?? 'P').slice(0, 1)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-[var(--bb-ink)] truncate">{t.subject}</p>
                      {(t.unread_count ?? 0) > 0 && (
                        <span className="w-5 h-5 bg-[var(--h-danger)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                          {t.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[var(--bb-ink-muted)] truncate">{t.last_message ?? 'No messages yet'}</p>
                  </div>
                </Link>
              ))
              : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <MessageSquare size={28} className="text-[var(--bb-ink-muted)] mb-3" />
                  <p className="text-[14px] font-semibold text-[var(--bb-ink)]">No messages</p>
                  <p className="text-[12px] text-[var(--bb-ink-soft)] mt-1">Start a conversation with your care team</p>
                </div>
              )
            }
          </div>
        </section>

        {/* AI insights + care */}
        <section>
          <h2 className="text-[15px] font-bold text-[var(--bb-ink)] mb-3">Health Insights</h2>
          <div className="space-y-3">
            <InsightCard
              type="recommendation"
              title="Annual Check-up"
              message="Schedule your annual physical to stay ahead of potential health issues."
              action={{ label: 'Book Now', href: '/patient/appointments/book' }}
            />
            <InsightCard
              type="tip"
              title="Blue Boney AI"
              message="Ask your care AI any health question — powered by Claude AI."
              action={{ label: 'Start Chat', href: '/patient/ai' }}
            />
            {unreadCount > 0 && (
              <InsightCard
                type="alert"
                title={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
                message="Your care team has sent you a message."
                action={{ label: 'Read Now', href: '/patient/messages' }}
              />
            )}
          </div>
        </section>
      </div>

      {/* Medications strip */}
      {prescriptions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-[var(--bb-ink)]">Active Medications</h2>
            <Link href="/patient/medications" className="text-[12px] text-[var(--h-teal)] font-medium flex items-center gap-0.5 hover:underline">
              Manage <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {prescriptions.slice(0, 5).map(rx => (
              <div key={rx.id} className="bg-white rounded-[10px] border border-[var(--bb-border)] px-4 py-3 flex-shrink-0 flex items-center gap-2">
                <Pill size={14} color="var(--h-teal)" />
                <span className="text-[13px] font-medium text-[var(--bb-ink)] whitespace-nowrap">{rx.medication_name}</span>
                {(rx.refills_remaining ?? 1) === 0 && (
                  <span className="text-[11px] text-[var(--h-danger)] font-medium">Refill needed</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
