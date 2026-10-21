/**
 * The portal has no banking sign-in (A2-2a move 1, D-A2-3: "retire the exchange
 * for patients"). The only patient session is P2's chart session.
 *
 * The routes are transpiled with this repo's TypeScript from the files the tree
 * has, so this runs against the old code unchanged. The API is a stand-in for
 * fetch that, like the old backend, logs a banking user in, mints a health
 * session for their banking token at POST /health/session, and serves health
 * routes to a health token.
 *
 * Old code fails: /api/auth signed in with a banking password and set the cookie;
 * the proxy exchanged that cookie's banking token at POST /health/session and
 * forwarded it as a Bearer; /api/session answered with a banking session.
 *
 * Run: node --test scripts/test/banking-signin-retired.test.mjs
 */
import { test, before, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { SignJWT } from 'jose'

const ROOT = join(import.meta.dirname, '..', '..')
const OUT = join(ROOT, 'node_modules', '.cache', 'banking-signin-retired-test')
process.env.PATIENT_JWT_SECRET = 'banking-signin-retired-test-secret'
process.env.BACKEND_URL = 'https://api.example/api'

const compile = (from, to) => {
  const src = readFileSync(join(ROOT, from), 'utf8')
  let js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  js = js.replace(/from ['"](?:\.\/|@\/)lib\/patientAuth['"]/g, "from './lib/patientAuth.mjs'")
    // Node's ESM loader needs the extension: next has no exports map.
    .replace(/from ['"]next\/(server|headers)['"]/g, "from 'next/$1.js'")
  mkdirSync(join(OUT, 'lib'), { recursive: true })
  writeFileSync(join(OUT, to), js)
}

let proxyRoute, authRoute, sessionRoute
before(async () => {
  rmSync(OUT, { recursive: true, force: true })
  compile('lib/patientAuth.ts', 'lib/patientAuth.mjs')
  compile('app/api/proxy/[...path]/route.ts', 'proxy-route.mjs')
  compile('app/api/auth/route.ts', 'auth-route.mjs')
  compile('app/api/session/route.ts', 'session-route.mjs')
  proxyRoute   = await import(join(OUT, 'proxy-route.mjs'))
  authRoute    = await import(join(OUT, 'auth-route.mjs'))
  sessionRoute = await import(join(OUT, 'session-route.mjs'))
})

const sign = claims =>
  new SignJWT(claims).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.PATIENT_JWT_SECRET))
const bankingCookie = () => sign({ kind: 'banking', userId: 'u', fullName: 'U', phone: '+231770000000', tier: 'basic', kycStatus: 'verified', token: 'live-banking' })
const chartCookie   = () => sign({ kind: 'health', healthPatientId: 'p', fullName: 'P', healthToken: 'live-health', expiresAt: '' })

const asked = []
const realFetch = globalThis.fetch
beforeEach(() => {
  asked.length = 0
  globalThis.fetch = async (url, init = {}) => {
    const h = new Headers(init.headers)
    const call = { url: String(url), method: init.method ?? 'GET', bearer: h.get('authorization'), health: h.get('x-health-token') }
    asked.push(call)
    const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
    if (call.url.endsWith('/auth/login')) {
      return json(200, { token: 'live-banking', user: { id: 'u', full_name: 'U', phone: '+231770000000', tier: 'basic', kyc_status: 'verified' } })
    }
    if (call.url.endsWith('/health/session') && call.method === 'POST') {
      return call.bearer === 'Bearer live-banking'
        ? json(200, { health_token: 'minted-from-banking', expires_at: new Date(Date.now() + 3_600_000).toISOString() })
        : json(401, { error: 'unauthorized' })
    }
    if (call.url.includes('/health/')) {
      return ['live-health', 'minted-from-banking'].includes(call.health) ? json(200, { orders: [] }) : json(401, { error: 'health_unauthorized' })
    }
    return json(404, { error: 'not_found' })
  }
})
afterEach(() => { globalThis.fetch = realFetch })

const { NextRequest } = await import('next/server.js')
const withCookie = (url, cookie, init = {}) =>
  new NextRequest(url, { ...init, headers: { ...(init.headers ?? {}), ...(cookie ? { cookie: `patient_portal_token=${cookie}` } : {}) } })
const proxied = (cookie, path) =>
  proxyRoute.GET(withCookie(`https://health.example/api/proxy/${path.join('/')}`, cookie), { params: Promise.resolve({ path }) })

test('a chart session reaches health routes with its own token, and nothing is exchanged (control)', async () => {
  const res = await proxied(await chartCookie(), ['health', 'labs'])
  assert.equal(res.status, 200)
  assert.deepEqual(asked.map(c => [c.method, c.url, c.health, c.bearer]),
    [['GET', 'https://api.example/api/health/labs', 'live-health', null]])
})

test('a banking cookie gets 401 from the proxy, and nothing reaches the API', async () => {
  const res = await proxied(await bankingCookie(), ['health', 'labs'])
  assert.deepEqual(asked, [], `the proxy called: ${asked.map(c => `${c.method} ${c.url} bearer=${c.bearer} health=${c.health}`).join(', ')}`)
  assert.equal(res.status, 401)
})

test('the banking sign-in is gone: no banking login is called and no cookie is set', async () => {
  for (const body of [
    { action: 'login', phone: '+231770000000', password: 'password' },
    { action: 'verify_otp', temp_token: 't', code: '123456' },
  ]) {
    const res = await authRoute.POST(new NextRequest('https://health.example/api/auth', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    }))
    assert.equal(res.status, 400, `${body.action}: status ${res.status}, set-cookie ${res.headers.get('set-cookie') ? 'yes' : 'no'}, called ${asked.map(c => c.url).join(', ')}`)
    assert.deepEqual(await res.json(), { error: 'invalid_action' })
    assert.equal(res.headers.get('set-cookie'), null, `${body.action} set a cookie`)
  }
  assert.deepEqual(asked, [], `the sign-in called: ${asked.map(c => c.url).join(', ')}`)
})

test('the portal reads a banking cookie as no session; a chart cookie is still one', async () => {
  const banking = await sessionRoute.GET(withCookie('https://health.example/api/session', await bankingCookie()))
  assert.deepEqual(await banking.json(), { session: null })
  const chart = await sessionRoute.GET(withCookie('https://health.example/api/session', await chartCookie()))
  assert.deepEqual(await chart.json(), { session: { kind: 'health', healthPatientId: 'p', fullName: 'P' } })
})
