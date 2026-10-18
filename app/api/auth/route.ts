import { NextRequest, NextResponse } from 'next/server'
import { signPatientToken, sessionCookieOptions, COOKIE, type HealthOnlySession } from '@/lib/patientAuth'

const BACKEND = process.env.BACKEND_URL ?? 'https://blueboney.vercel.app/api'

export async function POST(req: NextRequest) {
  try {
    const { action, ...body } = await req.json()

    if (action === 'login') {
      // Step 1: phone + password → Blue Boney backend
      const { phone, password } = body
      if (!phone || !password) {
        return NextResponse.json({ error: 'phone and password required' }, { status: 400 })
      }

      const upstream = await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone, password,
          device_name: 'Blue Boney Health Portal',
          device_platform: 'web',
        }),
      })
      const data = await upstream.json()

      if (!upstream.ok) {
        return NextResponse.json({ error: data.error ?? 'invalid_credentials' }, { status: upstream.status })
      }

      if (data.next === 'verify_device') {
        // OTP sent — relay temp_token and masked phone to client
        return NextResponse.json({
          next:         'verify_otp',
          temp_token:   data.temp_token,
          phone_masked: data.phone_masked,
        })
      }

      // Known device — session issued immediately
      if (data.token && data.user) {
        const session = {
          userId:    data.user.id,
          fullName:  data.user.full_name,
          phone:     data.user.phone,
          tier:      data.user.tier,
          kycStatus: data.user.kyc_status,
          token:     data.token,
        }
        const portalToken = await signPatientToken(session)
        const res = NextResponse.json({ success: true, user: { fullName: session.fullName, tier: session.tier } })
        res.cookies.set(COOKIE, portalToken, sessionCookieOptions())
        return res
      }

      return NextResponse.json({ error: 'unexpected_response' }, { status: 500 })
    }

    if (action === 'verify_otp') {
      const { temp_token, code } = body
      if (!temp_token || !code) {
        return NextResponse.json({ error: 'temp_token and code required' }, { status: 400 })
      }

      const upstream = await fetch(`${BACKEND}/auth/verify-login-device`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp_token, code,
          device_name: 'Blue Boney Health Portal',
          device_platform: 'web',
        }),
      })
      const data = await upstream.json()

      if (!upstream.ok) {
        return NextResponse.json({ error: data.error ?? 'invalid_otp' }, { status: upstream.status })
      }

      if (data.token && data.user) {
        const session = {
          userId:    data.user.id,
          fullName:  data.user.full_name,
          phone:     data.user.phone,
          tier:      data.user.tier,
          kycStatus: data.user.kyc_status,
          token:     data.token,
        }
        const portalToken = await signPatientToken(session)
        const res = NextResponse.json({ success: true, user: { fullName: session.fullName, tier: session.tier } })
        res.cookies.set(COOKIE, portalToken, sessionCookieOptions())
        return res
      }

      return NextResponse.json({ error: 'unexpected_response' }, { status: 500 })
    }

    // ── Health record sign-in (P2): no banking account ─────────────────────
    // Step 1: record number or phone, plus date of birth. The backend answers the
    // same whatever happened and texts the phone the clinic recorded.
    if (action === 'claim_start') {
      const { uhr_number, phone, date_of_birth } = body as Record<string, string | undefined>
      if (!date_of_birth || !!uhr_number === !!phone) {
        return NextResponse.json({ error: 'record number or phone, and date of birth, required' }, { status: 400 })
      }
      // The backend limits sign-in starts per address. Forward the patient's, or
      // every portal user shares this server's one. (On Vercel the next hop
      // overwrites X-Forwarded-For, so this alone is not enough there: see PR.)
      const client = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      const upstream = await fetch(`${BACKEND}/health/patient-auth/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(client ? { 'X-Forwarded-For': client } : {}) },
        body: JSON.stringify(uhr_number ? { uhr_number, date_of_birth } : { phone, date_of_birth }),
      })
      const data = await upstream.json().catch(() => ({}))
      if (!upstream.ok) return NextResponse.json({ error: data.error ?? 'request_failed' }, { status: upstream.status })
      return NextResponse.json({ challenge_id: data.challenge_id, detail: data.detail })
    }

    // Step 2: the code, then the PIN (set the first time, entered after), on one
    // challenge. Only the last step returns a health session; the cookie carries it.
    if (action === 'claim_verify') {
      const { challenge_id, code, pin, new_pin } = body as Record<string, string | undefined>
      const step = code ? { code } : pin ? { pin } : new_pin ? { new_pin } : null
      if (!challenge_id || !step) return NextResponse.json({ error: 'challenge_id and a code or PIN required' }, { status: 400 })
      const upstream = await fetch(`${BACKEND}/health/patient-auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id, ...step }),
      })
      const data = await upstream.json().catch(() => ({}))
      if (!upstream.ok) {
        // A refusal keeps its message and reference; everything else keeps its code.
        return NextResponse.json(data?.code === 'HEALTH_ACCESS_REFUSED' ? data
          : { error: data.error ?? 'invalid_code', problem: data.problem, detail: data.detail },
          { status: upstream.status })
      }
      if (data.next === 'set_pin' || data.next === 'enter_pin') return NextResponse.json({ next: data.next })
      const me = await fetch(`${BACKEND}/health/patient/me`, { headers: { 'X-Health-Token': data.health_token } })
      const meData = await me.json().catch(() => null)
      const name = meData?.patient ? `${meData.patient.given_name} ${meData.patient.family_name}`.trim() : 'Patient'
      const session: HealthOnlySession = {
        kind: 'health', healthPatientId: data.health_patient_id, fullName: name,
        healthToken: data.health_token, expiresAt: data.expires_at,
      }
      const portalToken = await signPatientToken(session)
      const res = NextResponse.json({ success: true, first_claim: data.first_claim === true, user: { fullName: name } })
      res.cookies.set(COOKIE, portalToken, sessionCookieOptions())
      return res
    }

    return NextResponse.json({ error: 'invalid_action' }, { status: 400 })
  } catch (e: any) {
    console.error('[patient auth error]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
