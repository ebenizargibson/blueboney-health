import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE = 'patient_portal_token'
const EXPIRY_SECONDS = 60 * 60 * 8 // 8 hours

export interface PatientSession {
  userId:     string
  fullName:   string
  phone:      string
  tier:       string
  kycStatus:  string
  token:      string  // Blue Boney session token (forwarded as Authorization: Bearer)
}

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
    return payload as unknown as PatientSession
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
