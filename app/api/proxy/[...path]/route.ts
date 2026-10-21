import { NextRequest, NextResponse } from 'next/server'
import { getPatientSession } from '@/lib/patientAuth'

const BACKEND = process.env.BACKEND_URL ?? 'https://blueboney.vercel.app/api'

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await getPatientSession(req)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { path } = await params
  const backendPath = path.join('/')
  const url = new URL(`${BACKEND}/${backendPath}`)

  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v))

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text()

  return healthOnly(req, session.healthToken, backendPath, url, body)
}

/**
 * A patient signed in to their chart with no banking account (P2). Its health
 * session goes as X-Health-Token, to health routes only, and nothing is exchanged.
 * It is the portal's only session: the banking sign-in, the exchange of its token
 * at POST /health/session and the banking Bearer forwarded with it were retired in
 * A2-2a (D-A2-3).
 *
 * Some routes under /health still read only a banking session (/health/status,
 * appointments, billing; they move in P4). They answer 401 for want of a banking
 * token, and the client treats 401 as "signed out" and sends the patient to the
 * login page, which would loop. So a 401 that is not the health session's own
 * (health_session_expired, health_unauthorized, a re-home or an ended session)
 * becomes 403 bank_account_required: that page needs a linked account.
 */
async function healthOnly(req: NextRequest, healthToken: string, backendPath: string, url: URL, body: string | undefined) {
  if (!(backendPath.startsWith('health/') || backendPath.startsWith('uhr/'))) {
    return NextResponse.json({ error: 'bank_account_required' }, { status: 403 })
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Health-Token': healthToken }
  const idempotencyKey = req.headers.get('Idempotency-Key')
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
  const upstream = await fetch(url.toString(), { method: req.method, headers, ...(body ? { body } : {}) })
  const data = await upstream.json().catch(() => null) as { error?: string; code?: string } | null
  if (upstream.status === 401) {
    const own = typeof data?.error === 'string' && data.error.startsWith('health_')
    if (!own) return NextResponse.json({ error: 'bank_account_required' }, { status: 403 })
  }
  return NextResponse.json(data, { status: upstream.status })
}

export const GET    = proxy
export const POST   = proxy
export const PATCH  = proxy
export const DELETE = proxy
export const PUT    = proxy
