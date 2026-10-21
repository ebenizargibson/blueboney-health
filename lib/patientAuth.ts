import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE = 'patient_portal_token'
const EXPIRY_SECONDS = 60 * 60 * 8 // 8 hours

/**
 * Signed in to the chart a clinic registered, by a code to the phone the clinic
 * recorded (P2). There is no banking account behind it: only the health session,
 * forwarded as X-Health-Token, and only to health routes.
 *
 * The portal's only session. The banking sign-in, and the exchange of its token
 * for a health session, were retired in A2-2a (D-A2-3).
 */
export interface HealthOnlySession {
  kind:            'health'
  healthPatientId: string
  fullName:        string
  healthToken:     string
  expiresAt:       string
}

export type PatientSession = HealthOnlySession

function secret() {
  const s = process.env.PATIENT_JWT_SECRET
  if (!s) throw new Error('PATIENT_JWT_SECRET not set')
  return new TextEncoder().encode(s)
}

export async function signPatientToken(session: PatientSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRY_SECONDS}s`)
    .sign(secret())
}

export async function verifyPatientToken(token: string): Promise<PatientSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    // A cookie the banking sign-in set before it was retired is not a session.
    return payload.kind === 'health' ? payload as unknown as PatientSession : null
  } catch {
    return null
  }
}

export async function getPatientSession(req?: { cookies: { get: (n: string) => { value: string } | undefined } }): Promise<PatientSession | null> {
  let raw: string | undefined
  if (req) {
    raw = req.cookies.get(COOKIE)?.value
  } else {
    const jar = await cookies()
    raw = jar.get(COOKIE)?.value
  }
  if (!raw) return null
  return verifyPatientToken(raw)
}

export function sessionCookieOptions(maxAge: number = EXPIRY_SECONDS) {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
    path:     '/',
  }
}

export { COOKIE, EXPIRY_SECONDS }
