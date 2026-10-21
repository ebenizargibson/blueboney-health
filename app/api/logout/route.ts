import { NextRequest, NextResponse } from 'next/server'
import { COOKIE, getPatientSession } from '@/lib/patientAuth'

const BACKEND = process.env.BACKEND_URL ?? 'https://blueboney.vercel.app/api'

export async function POST(req: NextRequest) {
  // A health-record sign-in (P2) holds a backend health session; end it there too,
  // so signing out is not only forgetting the cookie.
  const session = await getPatientSession(req)
  if (session) {
    await fetch(`${BACKEND}/health/session`, { method: 'DELETE', headers: { 'X-Health-Token': session.healthToken } })
      .catch(() => { /* the cookie is cleared regardless */ })
  }
  const res = NextResponse.json({ success: true })
  res.cookies.set(COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
