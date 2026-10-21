'use client'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart } from 'lucide-react'
import { portalAuth, PATIENT_SIGNIN_ON } from '@/lib/api'
import { HealthRecordSignIn } from '@/components/auth/HealthRecordSignIn'

/**
 * The only patient sign-in is the chart sign-in (P2). The banking one (phone and
 * password) was retired in A2-2a (D-A2-3), so while P2's flag is off, sign-in is
 * closed.
 */
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/patient'

  // Redirect if already logged in
  useEffect(() => {
    portalAuth.session().then((res: { session: unknown }) => {
      if (res.session) router.push(from)
    }).catch(() => {})
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--bb-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="bg-white rounded-[20px] border border-[var(--bb-border)] shadow-[var(--shadow-lg)] p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-[12px] bg-[var(--h-teal)] flex items-center justify-center shadow-[0_4px_12px_rgba(8,145,178,0.3)]">
              <Heart size={20} color="white" fill="white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[var(--bb-ink)]">Blue Boney Health</p>
              <p className="text-[11px] text-[var(--bb-ink-muted)]">Patient Portal · Secure Access</p>
            </div>
          </div>

          {PATIENT_SIGNIN_ON ? (
            <HealthRecordSignIn from={from} />
          ) : (
            <>
              <h2 className="text-[22px] font-bold text-[var(--bb-ink)] mb-2">Sign In</h2>
              <p className="text-[13px] text-[var(--bb-ink-soft)]">Patient sign-in is closed for now.</p>
            </>
          )}
        </div>

        <p className="text-center text-[12px] text-[var(--bb-ink-muted)] mt-5">
          All access is logged and encrypted · Session expires in 8 hours
        </p>
      </div>
    </div>
  )
}

/**
 * useSearchParams() opts this route out of prerendering. Without a Suspense
 * boundary Next fails the /login prerender and aborts the whole build, so the
 * patient portal produced no deployable output at all. Fifth instance of this
 * exact bug across the estate, after clinic, lab, pharmacy and provider.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
