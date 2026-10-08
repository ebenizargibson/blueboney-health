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
 *
 * A cached health token can be revoked before it expires: a death recorded
 * mid-session, a record re-homed by a merge (PATIENT_RECORD_REHOMED), a session
 * ended elsewhere. So a forwarded request that comes back 401 or 403
 * HEALTH_ACCESS_REFUSED evicts the cached token. A 401 on a CACHED token is then
 * retried once with a fresh exchange; a 401 on a token minted for this request
 * is returned as it is, so nothing here can loop.
 */
const healthTokens = new Map<string, { token: string; expiresAt: number }>()
const refusals     = new Map<string, { status: number; body: unknown; until: number }>()
const REFUSAL_TTL_MS = 5 * 60_000

type Exchange = { token: string; fresh: boolean } | { refused: { status: number; body: unknown } } | null

const isRefusal = (status: number, body: unknown) =>
  status === 403 && (body as { code?: unknown } | null)?.code === 'HEALTH_ACCESS_REFUSED'

function rememberRefusal(bbToken: string, status: number, body: unknown) {
  const refused = { status, body, until: Date.now() + REFUSAL_TTL_MS }
  healthTokens.delete(bbToken)
  refusals.set(bbToken, refused)
  return refused
}

async function healthSessionFor(bbToken: string): Promise<Exchange> {
  const hit = healthTokens.get(bbToken)
  if (hit && hit.expiresAt > Date.now() + 60_000) return { token: hit.token, fresh: false }
  const refusal = refusals.get(bbToken)
  if (refusal && refusal.until > Date.now()) return { refused: refusal }

  try {
    const res  = await fetch(`${BACKEND}/health/session`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${bbToken}`, 'Content-Type': 'application/json' },
    })
    const data = await res.json().catch(() => null)
    if (isRefusal(res.status, data)) return { refused: rememberRefusal(bbToken, res.status, data) }
    if (!res.ok || !data?.health_token) return null
    healthTokens.set(bbToken, {
      token:     data.health_token,
      expiresAt: data.expires_at ? Date.parse(data.expires_at) : Date.now() + 5 * 60_000,
    })
    return { token: data.health_token, fresh: true }
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

  const forward = async () => {
    const upstream = await fetch(url.toString(), { method: req.method, headers, ...(body ? { body } : {}) })
    return { status: upstream.status, data: await upstream.json().catch(() => null) as unknown }
  }

  if (!(backendPath.startsWith('health/') || backendPath.startsWith('uhr/'))) {
    const { status, data } = await forward()
    return NextResponse.json(data, { status })
  }

  const exchange = await healthSessionFor(session.token)
  if (exchange && 'refused' in exchange) {
    return NextResponse.json(exchange.refused.body, { status: exchange.refused.status })
  }
  if (exchange) headers['X-Health-Token'] = exchange.token

  let res = await forward()
  if (isRefusal(res.status, res.data)) {
    rememberRefusal(session.token, res.status, res.data)
  } else if (res.status === 401 && exchange) {
    healthTokens.delete(session.token)
    if (!exchange.fresh) {
      const again = await healthSessionFor(session.token)
      if (again && 'refused' in again) {
        return NextResponse.json(again.refused.body, { status: again.refused.status })
      }
      if (again) {
        headers['X-Health-Token'] = again.token
        res = await forward()
        if (isRefusal(res.status, res.data)) rememberRefusal(session.token, res.status, res.data)
        else if (res.status === 401) healthTokens.delete(session.token)
      }
    }
  }
  return NextResponse.json(res.data, { status: res.status })
}

export const GET    = proxy
export const POST   = proxy
export const PATCH  = proxy
export const DELETE = proxy
export const PUT    = proxy
