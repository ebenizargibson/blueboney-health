import { NextRequest, NextResponse } from 'next/server'
import { signPatientToken, sessionCookieOptions, COOKIE } from '@/lib/patientAuth'

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

    return NextResponse.json({ error: 'invalid_action' }, { status: 400 })
  } catch (e: any) {
    console.error('[patient auth error]', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
