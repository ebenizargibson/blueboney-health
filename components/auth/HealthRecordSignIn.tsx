'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { portalAuth } from '@/lib/api'

/**
 * Sign in with the health record a clinic registered (P2), no Blue Boney account
 * needed: the record number from the slip (or the phone the clinic recorded) and
 * the date of birth send a code to that phone. Then a PIN (D7 as changed
 * 2026-10-18): the first time the patient sets one; every time after, the code
 * and the PIN sign them in, never the code and the birth date.
 */
export function HealthRecordSignIn({ onBack, from }: { onBack: () => void; from: string }) {
  const [by, setBy]       = useState<'record' | 'phone'>('record')
  const [value, setValue] = useState('')
  const [dob, setDob]     = useState('')
  const [step, setStep]   = useState<'details' | 'code' | 'set_pin' | 'enter_pin'>('details')
  const [challenge, setChallenge] = useState('')
  const [code, setCode]   = useState('')
  const [pin, setPin]     = useState('')
  const [pin2, setPin2]   = useState('')
  const [note, setNote]   = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)
  const router = useRouter()

  const sendCode = async () => {
    setBusy(true); setError('')
    try {
      const res = await portalAuth.claimStart(by === 'record' ? { uhr_number: value.trim(), date_of_birth: dob } : { phone: value.trim(), date_of_birth: dob })
      if (res.error) setError(res.error === 'too_many_attempts' ? 'Too many attempts. Try again later.' : 'Check the details and try again.')
      else { setChallenge(res.challenge_id); setNote(res.detail); setStep('code') }
    } catch { setError('Network error. Please try again.') }
    setBusy(false)
  }

  const failure = (res: { error?: string; code?: string; message?: string; reference?: string; detail?: string }) =>
    res.error === 'too_many_attempts' ? 'Too many incorrect attempts. Try again in half an hour.'
    : res.error === 'desk_required'   ? 'This record can only be opened at your clinic for now. Please visit the desk.'
    : res.code === 'HEALTH_ACCESS_REFUSED' ? `${res.message} Reference: ${res.reference}`
    : res.error === 'pin_rejected'    ? (res.detail ?? 'Choose a different PIN.')
    : res.error === 'wrong_pin'       ? 'That PIN is not right.'
    : step === 'code' ? 'That code is not right, or it has expired.'
    : 'That did not work. Start again from your details.'

  const submit = async () => {
    if (step === 'set_pin' && pin !== pin2) { setError('The two PINs are not the same.'); return }
    setBusy(true); setError('')
    try {
      const res = await portalAuth.claimVerify(challenge,
        step === 'code' ? { code } : step === 'set_pin' ? { new_pin: pin } : { pin })
      if (res.success) { router.push(from); return }
      if (res.next === 'set_pin' || res.next === 'enter_pin') { setStep(res.next); setPin(''); setPin2('') }
      else setError(failure(res))
    } catch { setError('Network error. Please try again.') }
    setBusy(false)
  }

  const input = 'w-full h-11 px-3 rounded-[10px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[14px] text-[var(--bb-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]'
  const digits = 'w-full h-14 rounded-[10px] border border-[var(--bb-border)] bg-[var(--bb-bg)] text-[28px] font-mono font-bold text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--h-teal)]'
  const label = 'block text-[12px] font-semibold text-[var(--bb-ink-soft)] mb-1.5 uppercase tracking-wide'

  return (
    <>
      <h2 className="text-[22px] font-bold text-[var(--bb-ink)] mb-2">Your health record</h2>
      {step === 'details' ? (
        <>
          <p className="text-[13px] text-[var(--bb-ink-soft)] mb-5">Use the record number on the slip the clinic gave you.</p>
          <div className="flex gap-2 mb-4" role="tablist">
            {(['record', 'phone'] as const).map(k => (
              <button key={k} role="tab" aria-selected={by === k} onClick={() => { setBy(k); setValue('') }}
                className={`flex-1 h-9 rounded-[8px] text-[13px] font-semibold border ${by === k
                  ? 'bg-[var(--h-teal)] text-white border-[var(--h-teal)]' : 'border-[var(--bb-border)] text-[var(--bb-ink-soft)]'}`}>
                {k === 'record' ? 'Record number' : 'Phone number'}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <label className={label} htmlFor="hr-value">{by === 'record' ? 'Record number' : 'Phone the clinic recorded'}</label>
            <input id="hr-value" className={input} value={value} onChange={e => setValue(e.target.value)}
              placeholder={by === 'record' ? 'UHR-LR-2026-000123' : '+231 77 000 0000'} type={by === 'phone' ? 'tel' : 'text'} />
          </div>
          <div className="mb-6">
            <label className={label} htmlFor="hr-dob">Date of birth</label>
            <input id="hr-dob" className={input} type="date" value={dob} onChange={e => setDob(e.target.value)} />
          </div>
        </>
      ) : step === 'code' ? (
        <>
          <p className="text-[13px] text-[var(--bb-ink-soft)] mb-5">{note}</p>
          <div className="mb-6">
            <label className={label} htmlFor="hr-code">Code</label>
            <input id="hr-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000" onKeyDown={e => e.key === 'Enter' && code.length === 6 && submit()}
              className={digits} />
          </div>
        </>
      ) : step === 'set_pin' ? (
        <>
          <p className="text-[13px] text-[var(--bb-ink-soft)] mb-5">
            Choose a 6-digit PIN. You will enter it, with a code we text you, every time you sign in.
            Do not use your date of birth or your phone number.
          </p>
          <div className="mb-4">
            <label className={label} htmlFor="hr-pin">New PIN</label>
            <input id="hr-pin" type="password" inputMode="numeric" autoComplete="new-password" value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} className={digits} />
          </div>
          <div className="mb-6">
            <label className={label} htmlFor="hr-pin2">Enter it again</label>
            <input id="hr-pin2" type="password" inputMode="numeric" autoComplete="new-password" value={pin2}
              onChange={e => setPin2(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && pin.length === 6 && pin2.length === 6 && submit()} className={digits} />
          </div>
        </>
      ) : (
        <>
          <p className="text-[13px] text-[var(--bb-ink-soft)] mb-5">Enter your 6-digit PIN.</p>
          <div className="mb-6">
            <label className={label} htmlFor="hr-pin">PIN</label>
            <input id="hr-pin" type="password" inputMode="numeric" autoComplete="current-password" value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && pin.length === 6 && submit()} className={digits} />
          </div>
        </>
      )}

      {error && (
        <div className="bg-[var(--h-danger-bg)] border border-[var(--h-danger)] rounded-[8px] px-3 py-2.5 mb-4" role="alert">
          <p className="text-[13px] text-[var(--h-danger)]">{error}</p>
        </div>
      )}

      <button onClick={step === 'details' ? sendCode : submit}
        disabled={busy || (step === 'details' ? !value.trim() || !dob
          : step === 'code' ? code.length !== 6
          : step === 'set_pin' ? pin.length !== 6 || pin2.length !== 6
          : pin.length !== 6)}
        className="w-full h-12 rounded-[10px] bg-[var(--h-teal)] text-white text-[15px] font-bold hover:bg-[var(--h-teal-hover)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
        {busy ? 'Please wait...' : step === 'details' ? 'Send me a code' : step === 'code' ? 'Continue' : step === 'set_pin' ? 'Set PIN and sign in' : 'Sign in'}
        {!busy && <ArrowRight size={16} />}
      </button>
      <button onClick={step !== 'details' ? () => { setStep('details'); setCode(''); setPin(''); setPin2(''); setError('') } : onBack}
        className="w-full mt-3 text-[13px] text-[var(--bb-ink-soft)] hover:text-[var(--bb-ink)] py-2">
        {step !== 'details' ? '← Start again' : '← Sign in with a Blue Boney account instead'}
      </button>
    </>
  )
}
