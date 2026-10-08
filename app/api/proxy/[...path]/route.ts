import { NextRequest, NextResponse } from 'next/server'
import { getPatientSession } from '@/lib/patientAuth'

const BACKEND = process.env.BACKEND_URL ?? 'https://blueboney.vercel.app/api'

/**
 * Clinical routes no longer accept a banking session.
 *
 * /health/labs, /health/imaging and the rest of the clinical domain read a health
 * session, so forwarding this portal's banking token gets 401, and the client
 * treats a 401 as a lapsed login and sends the patient back to sign in. The
 * proxy exchanges the banking token once for a patient health session
 * (POST /health/session) and forwards it as X-Health-Token. The banking token
 * still goes as Authorization for the routes that read it (/health/status).
 *
 * A REFUSED exchange (403 HEALTH_ACCESS_REFUSED) is answered as it is, with its
 * message and reference, and never retried: forwarding without a health token
 * would come back 401 and loop the patient through sign-in. Any other failed
 * exchange (an account not yet activated, a backend fault) forwards without a
 * health token, so activation and the banking-token routes keep working.
 *
 * Cached per banking token and re-minted a minute before expiry. A refusal is
 * cached too, for five minutes: every refused exchange is audited and gets a new
 * reference, so without it one dashboard load would file four attempts and show
 * the patient a reference that changes on every request.
 */
const healthTokens = new Map<string, { token: string; expiresAt: number }>()
const refusals     = new Map<string, { status: number; body: unknown; until: number }>()
const REFUSAL_TTL_MS = 5 * 60_000

type Exchange = { token: string } | { refused: { status: number; body: unknown } } | null

async function healthSessionFor(bbToken: string): Promise<Exchange> {
  const hit = healthTokens.get(bbToken)
  if (hit && hit.expiresAt > Date.now() + 60_000) return { token: hit.token }
  const refusal = refusals.get(bbToken)
  if (refusal && refusal.until > Date.now()) return { refused: refusal }

  try {
    const res  = await fetch(`${BACKEND}/health/session`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${bbToken}`, 'Content-Type': 'application/json' },
    })
    const data = await res.json().catch(() => null)
    if (res.status === 403 && data?.code === 'HEALTH_ACCESS_REFUSED') {
      const refused = { status: 403, body: data, until: Date.now() + REFUSAL_TTL_MS }
      refusals.set(bbToken, refused)
      return { refused }
    }
    if (!res.ok || !data?.health_token) return null
    healthTokens.set(bbToken, {
      token:     data.health_token,
      expiresAt: data.expires_at ? Date.parse(data.expires_at) : Date.now() + 5 * 60_000,
    })
    return { token: data.health_token }
  } catch {
    return null
  }
}

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await getPatientSession(req)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { path } = await params
  const backendPath = path.join('/')
  const url = new URL(`${BACKEND}/${backendPath}`)

  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v))

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text()

  const headers: Record<string, string> = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${session.token}`,
  }
  const idempotencyKey = req.headers.get('Idempotency-Key')
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

  if (backendPath.startsWith('health/') || backendPath.startsWith('uhr/')) {
    const exchange = await healthSessionFor(session.token)
    if (exchange && 'refused' in exchange) {
      return NextResponse.json(exchange.refused.body, { status: exchange.refused.status })
    }
    if (exchange) headers['X-Health-Token'] = exchange.token
  }

  const upstream = await fetch(url.toString(), {
    method: req.method,
    headers,
    ...(body ? { body } : {}),
  })

  const data = await upstream.json().catch(() => null)
  return NextResponse.json(data, { status: upstream.status })
}

export const GET    = proxy
export const POST   = proxy
export const PATCH  = proxy
export const DELETE = proxy
export const PUT    = proxy
