import { NextRequest, NextResponse } from 'next/server'
import { COOKIE, verifyPatientToken, type PatientSession } from './lib/patientAuth'

const BACKEND = process.env.BACKEND_URL ?? 'https://blueboney.vercel.app/api'

/**
 * A patient page opens only for a session the API recognises.
 *
 * This used to let a page open whenever a patient_portal_token cookie was
 * present, whatever its value, so a placeholder passed (founder ruling
 * 2026-10-19: give the patient portal the hospital's fix). Now the cookie must
 * be this portal's own signed token, and the session inside it must still be
 * live at the API: GET /health/session for the chart session, the only kind
 * since the banking sign-in was retired (A2-2a). Anything but a yes, including
 * the API being unreachable, sends the patient to sign in, and a rejected cookie
 * (a banking one among them) is cleared.
 */
export async function proxy(req: NextRequest) {
  const raw = req.cookies.get(COOKIE)?.value
  const session = raw ? await verifyPatientToken(raw) : null
  if (session && (await sessionIsLive(session))) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('from', req.nextUrl.pathname)
  const res = NextResponse.redirect(loginUrl)
  if (raw) res.cookies.delete(COOKIE)
  return res
}

async function sessionIsLive(session: PatientSession): Promise<boolean> {
  const init = { cache: 'no-store' as const, signal: AbortSignal.timeout(5000) }
  try {
    const res = await fetch(`${BACKEND}/health/session`, { ...init, headers: { 'X-Health-Token': session.healthToken } })
    return res.ok
  } catch {
    return false
  }
}

export const config = {
  matcher: ['/patient/:path*'],
}
