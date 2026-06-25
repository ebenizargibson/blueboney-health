import { NextRequest, NextResponse } from 'next/server'
import { getPatientSession } from '@/lib/patientAuth'

const BACKEND = process.env.BACKEND_URL ?? 'https://blueboney.vercel.app/api'

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await getPatientSession(req)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { path } = await params
  const url = new URL(`${BACKEND}/${path.join('/')}`)

  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v))

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text()

  const upstream = await fetch(url.toString(), {
    method:  req.method,
    headers: {
      'Content-Type':    'application/json',
      'Authorization':   `Bearer ${session.token}`,
      ...(req.headers.get('Idempotency-Key')
        ? { 'Idempotency-Key': req.headers.get('Idempotency-Key')! }
        : {}),
    },
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
