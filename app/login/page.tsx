'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { portalAuth } from '@/lib/api'

function LoginForm() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [phone,     setPhone]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [otp,       setOtp]       = useState('')
  const [tempToken, setTempToken] = useState('')
  const [phoneMasked, setPhoneMasked] = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/patient'

  // Redirect if already logged in
  useEffect(() => {
    portalAuth.session().then((res: { session: unknown }) => {
      if (res.session) router.push(from)
    }).catch(() => {})
  }, [router])

  const handleLogin = async () => {
    if (!phone || !password) return
    setLoading(true); setError('')
    try {
      const res = await portalAuth.login(phone, password)
      if (res.error) {
        setError(res.error === 'invalid_credentials' ? 'Invalid phone number or password' : res.error)
      } else if (res.next === 'verify_otp') {
        setTempToken(res.temp_token)
        setPhoneMasked(res.phone_masked)
        setStep('otp')
      } else if (res.success) {
        router.push(from)
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return
    setLoading(true); setError('')
    try {
      const res = await portalAuth.verifyOtp(tempToken, otp)
      if (res.error) {
        setError(res.error === 'invalid_otp' ? 'Incorrect code. Please try again.' : res.error === 'otp_expired' ? 'Code expired. Please start over.' : res.error)
        if (res.error === 'otp_expired') { setStep('credentials'); setOtp(''); setTempToken('') }
      } else if (res.success) {
        router.push(from)
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

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

          {step === 'credentials' ? (
            <>
              <h2 className="text-[22px] font-bold text-[var(--bb-ink)] mb-6">Sign In</h2>
              {/* Phone */}
              <div className="mb-4">
                <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] mb-1.5 uppercase tracking-wide">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)]" />
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+231 77 000 0000"
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('pw-input')?.focus()}
                    className="w-full h-11 pl-9 pr-3 rounded-[10px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[14px] text-[var(--bb-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] focus:border-[var(--h-teal)] transition-colors"
                  />
                </div>
              </div>
              {/* Password */}
              <div className="mb-6">
                <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)]" />
                  <input
                    id="pw-input" type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="w-full h-11 pl-9 pr-10 rounded-[10px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[14px] text-[var(--bb-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] focus:border-[var(--h-teal)] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--bb-ink-muted)] hover:text-[var(--bb-ink)]">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-[22px] font-bold text-[var(--bb-ink)] mb-2">Verify Your Identity</h2>
              <p className="text-[13px] text-[var(--bb-ink-soft)] mb-6">
                A 6-digit code was sent to <strong>{phoneMasked}</strong> via SMS.
              </p>
              <div className="mb-6">
                <label className="block text-[12px] font-semibold text-[var(--bb-ink-soft)] mb-1.5 uppercase tracking-wide">Verification Code</label>
                <input
                  type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                  className="w-full h-14 rounded-[10px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[28px] font-mono font-bold text-center text-[var(--bb-ink)] tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)] focus:border-[var(--h-teal)] transition-colors"
                />
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="bg-[var(--h-danger-bg)] border border-[var(--h-danger)] rounded-[8px] px-3 py-2.5 mb-4">
              <p className="text-[13px] text-[var(--h-danger)]">{error}</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={step === 'credentials' ? handleLogin : handleVerifyOtp}
            disabled={loading || (step === 'credentials' ? !phone || !password : otp.length !== 6)}
            className="w-full h-12 rounded-[10px] bg-[var(--h-teal)] text-white text-[15px] font-bold hover:bg-[var(--h-teal-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(8,145,178,0.3)]"
          >
            {loading ? 'Verifying...' : step === 'credentials' ? 'Continue' : 'Verify & Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>

          {step === 'otp' && (
            <button onClick={() => { setStep('credentials'); setOtp(''); setError('') }}
              className="w-full mt-3 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] transition-colors py-2">
              ← Back to login
            </button>
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
